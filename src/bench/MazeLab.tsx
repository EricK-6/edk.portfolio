import { useCallback, useEffect, useRef, useState } from 'react'
import { useOnScreen } from '../useOnScreen'
import { Controls, LabButton, LabCard, prefersStill, SCREEN, Screen, Segmented } from './Lab'

// The PhotonTracker's route planner, on a grid the size of its course maps.
//
// The robot had to find the shortest way between two points of a projected
// maze. The team compared five algorithms, built two (A* and breadth first
// search), and found what this shows: both always return a route of the same
// length, and A* gets there having looked at far fewer cells. BFS still went
// on the robot, because on a 15 x 19 map either finishes in milliseconds and
// BFS needs only a visited flag and a queue.
//
// Click any open cell and the robot searches for it, then drives there.

const COLS = 19
const ROWS = 15
type Cell = [number, number] // row, column
type Algo = 'bfs' | 'astar'

// a small seeded generator: the same seed is the same maze
function mulberry(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// A maze carved by a random walk through the odd cells, then opened up in a
// few places so it has loops: with no loops there is only ever one route, and
// nothing for a shortest-path search to choose between.
function makeMaze(seed: number): boolean[][] {
  const rand = mulberry(seed)
  const wall = Array.from({ length: ROWS }, () => Array<boolean>(COLS).fill(true))
  const stack: Cell[] = [[1, 1]]
  wall[1][1] = false
  while (stack.length) {
    const [r, c] = stack[stack.length - 1]
    const next = ([[-2, 0], [2, 0], [0, -2], [0, 2]] as Cell[])
      .map(([dr, dc]): Cell => [r + dr, c + dc])
      .filter(([rr, cc]) => rr > 0 && cc > 0 && rr < ROWS - 1 && cc < COLS - 1 && wall[rr][cc])
    if (!next.length) { stack.pop(); continue }
    const [rr, cc] = next[Math.floor(rand() * next.length)]
    wall[(r + rr) / 2][(c + cc) / 2] = false
    wall[rr][cc] = false
    stack.push([rr, cc])
  }
  let opened = 0
  for (let tries = 0; opened < 22 && tries < 600; tries++) {
    const r = 1 + Math.floor(rand() * (ROWS - 2))
    const c = 1 + Math.floor(rand() * (COLS - 2))
    // only a wall standing between two open cells, so opening it joins two
    // corridors rather than making a room
    const across = !wall[r][c - 1] && !wall[r][c + 1] && wall[r - 1][c] && wall[r + 1][c]
    const down = !wall[r - 1][c] && !wall[r + 1][c] && wall[r][c - 1] && wall[r][c + 1]
    if (wall[r][c] && (across || down)) { wall[r][c] = false; opened++ }
  }
  return wall
}

const key = ([r, c]: Cell) => r * COLS + c
const STEPS: Cell[] = [[-1, 0], [0, -1], [1, 0], [0, 1]]

// One search, either kind. `explored` is the order cells were taken off the
// list to be expanded, which is what the two algorithms differ in; `path` is
// the route back from the goal by way of each cell's parent.
function search(wall: boolean[][], start: Cell, goal: Cell, algo: Algo) {
  const parent = new Map<number, Cell>()
  const cost = new Map<number, number>([[key(start), 0]])
  const closed = new Set<number>()
  const explored: Cell[] = []
  // BFS takes the oldest; A* takes the lowest steps-so-far plus Manhattan
  // distance still to go, oldest first among equals
  const open: { cell: Cell; f: number; n: number }[] = [{ cell: start, f: 0, n: 0 }]
  let n = 0
  while (open.length) {
    let pick = 0
    if (algo === 'astar') for (let i = 1; i < open.length; i++) if (open[i].f < open[pick].f || (open[i].f === open[pick].f && open[i].n < open[pick].n)) pick = i
    const { cell } = open.splice(pick, 1)[0]
    if (closed.has(key(cell))) continue
    closed.add(key(cell))
    explored.push(cell)
    if (cell[0] === goal[0] && cell[1] === goal[1]) break
    for (const [dr, dc] of STEPS) {
      const to: Cell = [cell[0] + dr, cell[1] + dc]
      if (wall[to[0]]?.[to[1]] !== false || closed.has(key(to))) continue
      const g = cost.get(key(cell))! + 1
      // a shorter way to a cell already waiting replaces the longer one: the
      // step the team's first A* left out, which cost it two steps on one route
      if (cost.has(key(to)) && cost.get(key(to))! <= g) continue
      cost.set(key(to), g)
      parent.set(key(to), cell)
      const h = algo === 'astar' ? Math.abs(to[0] - goal[0]) + Math.abs(to[1] - goal[1]) : 0
      open.push({ cell: to, f: g + h, n: ++n })
    }
  }
  const path: Cell[] = []
  if (closed.has(key(goal))) {
    let at: Cell | undefined = goal
    while (at) { path.unshift(at); at = parent.get(key(at)) }
  }
  return { explored, path }
}

export default function MazeLab() {
  const [algo, setAlgo] = useState<Algo>('bfs')
  const [seed, setSeed] = useState(8)
  const [stats, setStats] = useState<{ bfs: number; astar: number; steps: number } | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const onScreen = useOnScreen(canvasRef, '0px')

  // what the canvas draws from, kept out of React: it changes every frame
  const world = useRef({
    wall: makeMaze(8),
    robot: [13, 1] as Cell,
    // where the current trip set out from, so the other algorithm can be
    // asked to make the very same trip
    from: [13, 1] as Cell,
    goal: [1, 17] as Cell,
    explored: [] as Cell[],
    path: [] as Cell[],
    shown: 0, // how many explored cells have been revealed
    drawn: 0, // how far along the path the route has been drawn
    driven: 0, // how far along it the robot is
    cursor: null as Cell | null,
  })
  const frame = useRef(0)

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const w = world.current
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const width = canvas.clientWidth
    const size = width / COLS
    const height = size * ROWS
    if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
    }
    const g = canvas.getContext('2d')!
    g.setTransform(dpr, 0, 0, dpr, 0, 0)
    g.clearRect(0, 0, width, height)
    const mid = ([r, c]: Cell): [number, number] => [(c + 0.5) * size, (r + 0.5) * size]

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (!w.wall[r][c]) continue
        g.fillStyle = 'rgba(233, 241, 238, 0.13)'
        g.beginPath()
        g.roundRect(c * size + 1, r * size + 1, size - 2, size - 2, 2.5)
        g.fill()
      }
    }
    // the search, spreading: the newest cells brightest
    for (let i = 0; i < w.shown; i++) {
      const [r, c] = w.explored[i]
      const fresh = Math.max(0, 1 - (w.shown - i) / 26)
      g.fillStyle = `rgba(94, 234, 212, ${0.16 + fresh * 0.5})`
      g.beginPath()
      g.roundRect(c * size + 2, r * size + 2, size - 4, size - 4, 2.5)
      g.fill()
    }
    // the route
    if (w.drawn > 0 && w.path.length > 1) {
      g.strokeStyle = SCREEN.gold
      g.lineWidth = Math.max(2, size * 0.24)
      g.lineJoin = g.lineCap = 'round'
      g.beginPath()
      const whole = Math.floor(w.drawn)
      w.path.slice(0, whole + 1).forEach((cell, i) => { const [x, y] = mid(cell); if (i) g.lineTo(x, y); else g.moveTo(x, y) })
      if (whole < w.path.length - 1) {
        const [ax, ay] = mid(w.path[whole])
        const [bx, by] = mid(w.path[whole + 1])
        g.lineTo(ax + (bx - ax) * (w.drawn - whole), ay + (by - ay) * (w.drawn - whole))
      }
      g.stroke()
    }
    // the goal, the keyboard's cursor, the robot
    const [gx, gy] = mid(w.goal)
    g.strokeStyle = SCREEN.gold
    g.lineWidth = 1.6
    g.beginPath(); g.arc(gx, gy, size * 0.34, 0, Math.PI * 2); g.stroke()
    g.fillStyle = SCREEN.gold
    g.beginPath(); g.arc(gx, gy, size * 0.12, 0, Math.PI * 2); g.fill()
    if (w.cursor) {
      g.strokeStyle = SCREEN.line
      g.lineWidth = 1.5
      g.strokeRect(w.cursor[1] * size + 1.5, w.cursor[0] * size + 1.5, size - 3, size - 3)
    }
    let [rx, ry] = mid(w.robot)
    if (w.path.length > 1 && w.driven > 0) {
      const whole = Math.min(Math.floor(w.driven), w.path.length - 1)
      const [ax, ay] = mid(w.path[whole])
      const [bx, by] = mid(w.path[Math.min(whole + 1, w.path.length - 1)])
      rx = ax + (bx - ax) * (w.driven - whole)
      ry = ay + (by - ay) * (w.driven - whole)
    }
    g.fillStyle = SCREEN.bg
    g.strokeStyle = SCREEN.line
    g.lineWidth = 2
    g.beginPath(); g.roundRect(rx - size * 0.36, ry - size * 0.36, size * 0.72, size * 0.72, size * 0.2); g.fill(); g.stroke()
    g.fillStyle = SCREEN.gold
    g.beginPath(); g.arc(rx, ry, size * 0.13, 0, Math.PI * 2); g.fill()
  }, [])

  // Search for a goal with both algorithms (the count is the comparison),
  // then play the chosen one: the spread, the route, the drive.
  const seek = useCallback((goal: Cell, which: Algo) => {
    cancelAnimationFrame(frame.current)
    const w = world.current
    // a drive that was cut short ends where the robot had got to
    if (w.path.length && w.driven > 0) w.robot = w.path[Math.min(Math.round(w.driven), w.path.length - 1)]
    w.goal = goal
    w.from = w.robot
    const both = { bfs: search(w.wall, w.robot, goal, 'bfs'), astar: search(w.wall, w.robot, goal, 'astar') }
    const chosen = both[which]
    w.explored = chosen.explored
    w.path = chosen.path
    w.shown = w.drawn = w.driven = 0
    setStats({ bfs: both.bfs.explored.length, astar: both.astar.explored.length, steps: Math.max(0, chosen.path.length - 1) })

    // the route stays drawn once the robot is there: it is the answer
    const arrive = () => {
      w.shown = w.explored.length
      w.drawn = w.driven = Math.max(0, w.path.length - 1)
      draw()
    }
    if (prefersStill()) { arrive(); return }

    let last = performance.now()
    const tick = (now: number) => {
      const dt = Math.min(50, now - last)
      last = now
      const end = Math.max(0, w.path.length - 1)
      if (w.shown < w.explored.length) w.shown = Math.min(w.explored.length, w.shown + Math.max(1, (w.explored.length / 900) * dt))
      else if (w.drawn < end) w.drawn = Math.min(end, w.drawn + dt / 14)
      else if (w.driven < end) w.driven = Math.min(end, w.driven + dt / 70)
      else { arrive(); return }
      draw()
      frame.current = requestAnimationFrame(tick)
    }
    frame.current = requestAnimationFrame(tick)
  }, [draw])

  // the first search runs when the lab is first seen, and a new map or a
  // different algorithm runs it again
  const armed = useRef(false)
  useEffect(() => {
    const w = world.current
    w.wall = makeMaze(seed)
    w.robot = [13, 1]
    w.path = []
    w.explored = []
    w.shown = w.drawn = w.driven = 0
    armed.current = false
    draw()
  }, [seed, draw])
  useEffect(() => {
    if (!onScreen || armed.current) return
    armed.current = true
    seek([1, 17], algo)
  }, [onScreen, seed, algo, seek])

  useEffect(() => {
    const onResize = () => draw()
    window.addEventListener('resize', onResize)
    return () => { window.removeEventListener('resize', onResize); cancelAnimationFrame(frame.current) }
  }, [draw])

  const cellAt = (clientX: number, clientY: number): Cell | null => {
    const canvas = canvasRef.current
    if (!canvas) return null
    const box = canvas.getBoundingClientRect()
    const c = Math.floor(((clientX - box.left) / box.width) * COLS)
    const r = Math.floor(((clientY - box.top) / box.height) * ROWS)
    return world.current.wall[r]?.[c] === false ? [r, c] : null
  }

  const pick = (cell: Cell | null) => { if (cell) seek(cell, algo) }

  const onKey = (e: React.KeyboardEvent) => {
    const w = world.current
    const move: Record<string, Cell> = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] }
    if (move[e.key]) {
      e.preventDefault()
      const from = w.cursor ?? w.goal
      // step over walls to the next open cell that way
      let to: Cell = [from[0] + move[e.key][0], from[1] + move[e.key][1]]
      while (w.wall[to[0]]?.[to[1]] === true) to = [to[0] + move[e.key][0], to[1] + move[e.key][1]]
      if (w.wall[to[0]]?.[to[1]] === false) { w.cursor = to; draw() }
    } else if ((e.key === 'Enter' || e.key === ' ') && w.cursor) {
      e.preventDefault()
      pick(w.cursor)
    }
  }

  // the same trip again, searched the other way
  const change = (next: Algo) => {
    const w = world.current
    setAlgo(next)
    armed.current = true
    cancelAnimationFrame(frame.current)
    w.robot = w.from
    w.path = []
    w.driven = 0
    seek(w.goal, next)
  }

  return (
    <LabCard
      id="autonomous-pathfinding-bot"
      from="BFS PhotonTracker · L3 Robotics"
      title="The shortest way through a maze, two ways"
    >
      <Screen>
        <canvas
          ref={canvasRef}
          tabIndex={0}
          role="application"
          aria-label="A 15 by 19 maze. Click an open cell, or move with the arrow keys and press Enter, to send the robot there."
          onPointerDown={(e) => pick(cellAt(e.clientX, e.clientY))}
          onKeyDown={onKey}
          onBlur={() => { world.current.cursor = null; draw() }}
          className="block w-full cursor-pointer touch-manipulation outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#f2c76e]"
          style={{ aspectRatio: `${COLS} / ${ROWS}` }}
        />
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-white/[0.07] px-3.5 py-2.5 font-mono text-[11px] tabular-nums" aria-live="polite">
          <span className="flex gap-3.5">
            <span style={{ color: algo === 'bfs' ? SCREEN.teal : SCREEN.soft }}>BFS {stats?.bfs ?? 0} cells</span>
            <span style={{ color: algo === 'astar' ? SCREEN.teal : SCREEN.soft }}>A* {stats?.astar ?? 0} cells</span>
          </span>
          <span style={{ color: SCREEN.gold }}>{stats?.steps ?? 0} steps either way</span>
        </div>
      </Screen>

      <div className="px-5 pt-3">
        <p className="min-h-[2.5rem] text-[13.5px] font-medium leading-snug text-grey-900">
          {stats && stats.bfs > 0
            ? `Same ${stats.steps} step route. A* looked at ${stats.astar} cells to find it, BFS at ${stats.bfs}: ${(stats.astar / stats.bfs).toFixed(2)} of the work.`
            : 'Click any open cell and the robot will find its way there.'}
        </p>
      </div>

      <Controls>
        <Segmented label="Search algorithm" options={[{ value: 'bfs', label: 'Breadth first' }, { value: 'astar', label: 'A*' }]} value={algo} onChange={change} />
        <LabButton onClick={() => setSeed((s) => s + 1)} data-track="bench-maze-new" className="ml-auto">New map</LabButton>
      </Controls>
    </LabCard>
  )
}
