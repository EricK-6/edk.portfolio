// The ride: six floors in space, one signal climbing them, and the sky above.
//
// This file is the only place three.js is imported, and it is loaded as its
// own chunk after the page has painted, so the name and the first words never
// wait for it.
//
// It does not own a clock or a scroll listener. The page tells it where the
// reader is (`seek`, in beats) and when to draw (`render`); everything here is
// a pure function of those two numbers. That is what makes it safe to scrub:
// scroll back up and the signal walks back down the same wire.
//
// Colour is handled by hand rather than by three's colour management. All of
// it is line art and light on a dark ground, composed the way a 2D canvas
// would compose it, so every colour below is the colour that reaches the
// screen and no texture is converted on the way in or out.

import * as THREE from 'three'
import { FLOORS, SKY_FROM, T_END, ease, ramp, travel } from './timeline'
import { drawPlate, GAP, PLATES } from './plates'
import { FLOW_REACH, lengthOf, PLATE, pointAt, type Pt } from './pen'

export interface RideOptions {
  // smaller textures and fewer pixels, for phones
  lite: boolean
  // nothing moves by itself: one picture per position, for reduced motion
  still: boolean
}

export interface Ride {
  seek: (t: number) => void
  point: (x: number, y: number, over: boolean) => void
  resize: (width: number, height: number) => void
  render: (now: number) => void
  dispose: () => void
}

// how far the signal climbs after the last floor, out through the clouds
const SKY_RISE = 34
const FOV = 26
const DEG = Math.PI / 180

// '#0a3d37' as the three numbers a shader wants
const rgb = (hex: string) => {
  const n = parseInt(hex.slice(1), 16)
  return new THREE.Vector3(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255)
}
const mix = (a: number, b: number, u: number) => a + (b - a) * u

// The colour of the space behind the stack, bottom and top of the frame, as
// the signal climbs: solder-mask dark, then deep water, then dawn, then the
// exact colour of the page the ride hands over to.
const SKY: [number, THREE.Vector3, THREE.Vector3][] = ([
  [0, '#020a09', '#07201e'],
  [2.6, '#030c0e', '#07242a'],
  [4.6, '#04101a', '#09293c'],
  [6.3, '#061625', '#0e3555'],
  [6.9, '#0c2c49', '#3b7aa1'],
  [7.28, '#7aaac4', '#cbdfe8'],
  [7.62, '#ecf1f0', '#fbfaf9'],
  [8, '#fbfaf9', '#fbfaf9'],
] as [number, string, string][]).map(([t, bottom, top]) => [t, rgb(bottom), rgb(top)])

// --- shaders -------------------------------------------------------------------

const PLATE_VERT = /* glsl */ `
  varying vec2 vUv;
  varying float vDepth;
  void main() {
    vUv = uv;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vDepth = -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`

// One plate: a sheet of tinted glass with a floor's artwork on it.
//
// uArt is the drawing. uFlow says, for every pixel of every wire, how far
// along the wire it is (see pen.ts), which is what lets a pulse run along a
// trace and lets the reader's scroll light the signal's route up to wherever
// it has reached. The glow is the drawing sampled from its own blurrier
// mipmaps, which costs two texture reads instead of a blur pass.
const PLATE_FRAG = /* glsl */ `
  uniform sampler2D uArt;
  uniform sampler2D uFlow;
  uniform float uTime;
  uniform float uHead;
  uniform float uAlpha;
  uniform float uGain;
  uniform float uBoot;
  uniform float uTorch;
  uniform vec2 uPointer;
  uniform vec2 uOrigin;
  uniform vec2 uFogRange;
  uniform vec3 uMask;
  uniform vec3 uRim;
  uniform vec3 uLit;
  uniform vec3 uFog;
  varying vec2 vUv;
  varying float vDepth;

  float roundBox(vec2 p, vec2 b, float r) {
    vec2 q = abs(p) - b + r;
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
  }

  float gridLines(vec2 g) {
    vec2 w = max(fwidth(g), vec2(0.0005));
    vec2 l = 1.0 - smoothstep(vec2(0.0), w * 1.5, abs(fract(g + 0.5) - 0.5));
    return max(l.x, l.y);
  }

  void main() {
    // the plate's own units: the origin in the middle, +y towards the camera
    vec2 p = vec2(vUv.x - 0.5, 0.5 - vUv.y) * ${PLATE.toFixed(1)};
    float sd = roundBox(p, vec2(5.82), 0.6);
    float aa = max(fwidth(sd), 0.0005);
    float inside = 1.0 - smoothstep(-aa, aa, sd);
    if (inside < 0.002) discard;

    float edge = 1.0 - smoothstep(0.0, aa * 2.0 + 0.012, abs(sd + 0.014));
    float inset = 1.0 - smoothstep(0.0, aa * 1.5 + 0.006, abs(sd + 0.2));
    float grid = gridLines(p * 2.0) * 0.028 + gridLines(p * 0.5) * 0.04;
    float sheen = 0.5 + (p.x - p.y) / 24.0;

    // power-on: the drawing spreads out from where the signal starts
    float reach = uBoot * 14.0;
    float r = distance(p, uOrigin);
    float shown = smoothstep(r, r + 0.9, reach);
    float front = exp(-pow((r - reach) * 1.6, 2.0)) * (1.0 - step(0.999, uBoot));

    vec4 art = texture2D(uArt, vUv);
    vec4 soft1 = texture2D(uArt, vUv, 2.4);
    vec4 soft2 = texture2D(uArt, vUv, 4.4);
    vec4 fl = texture2D(uFlow, vUv);
    vec3 fv = fl.rgb / max(fl.a, 0.001);
    float onWire = smoothstep(0.3, 0.7, fl.a);

    vec2 toPointer = p - uPointer;
    float torch = uTorch * exp(-dot(toPointer, toPointer) / 2.4);

    // the route the scroll drives: lit as far as the signal has travelled
    float isMain = onWire * step(0.5 / 255.0, fv.b);
    float along = clamp((fv.b * 255.0 - 1.0) / 254.0, 0.0, 1.0);
    float started = step(0.0, uHead);
    float lit = isMain * started * (1.0 - smoothstep(uHead - 0.006, uHead + 0.006, along));
    float head = isMain * started * step(uHead, 1.0) * exp(-pow((along - uHead) * 30.0, 2.0));

    // every other wire: a pulse now and then, each wire out of step with the rest
    float d = fv.r * ${FLOW_REACH.toFixed(1)};
    float w = fract(d / 14.0 - uTime * 0.08 + fv.g * 5.0);
    float comet = smoothstep(0.0, 0.07, w) * (1.0 - smoothstep(0.07, 0.085, w));
    float pulse = comet * onWire * (1.0 - isMain);

    float glassA = 0.6 * inside;
    vec3 col = uMask * glassA * (0.84 + 0.3 * sheen);
    col += uRim * grid * inside;
    col += uRim * (edge * 0.7 + inset * 0.1) * inside;
    float a = max(glassA, edge * 0.75 * inside);

    float ink = art.a * shown;
    col = col * (1.0 - ink) + art.rgb * shown * uGain * (1.0 + torch * 1.2);
    a = a + ink * (1.0 - a);

    vec3 glow = (soft1.rgb * 0.42 + soft2.rgb * 0.5) * shown * uGain * (1.0 + torch * 1.6);
    glow += uLit * lit * (art.a * 0.5 + soft1.a * 0.42);
    glow += uLit * head * (art.a * 0.9 + soft1.a * 1.0 + soft2.a * 0.8);
    glow += uLit * pulse * (art.a * 0.85 + soft1.a * 0.5) * shown;
    glow += uRim * front * 0.45 * inside;
    col += glow;

    float fog = smoothstep(uFogRange.x, uFogRange.y, vDepth);
    col = mix(col, uFog * a, fog);
    gl_FragColor = vec4(col, a) * uAlpha;
  }
`

// A climb between floors: a ribbon that always faces the camera.
const BEAM_VERT = /* glsl */ `
  attribute float aSide;
  attribute float aAlong;
  uniform float uWidth;
  varying float vSide;
  varying float vAlong;
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vec3 right = normalize(cross(vec3(0.0, 1.0, 0.0), cameraPosition - world.xyz));
    world.xyz += right * aSide * uWidth;
    vSide = aSide;
    vAlong = aAlong;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`

const BEAM_FRAG = /* glsl */ `
  uniform float uHead;
  uniform float uLen;
  uniform float uAlpha;
  uniform float uTime;
  uniform vec3 uLit;
  uniform vec3 uIdle;
  varying float vSide;
  varying float vAlong;
  void main() {
    float core = 1.0 - smoothstep(0.0, 0.14, abs(vSide));
    float halo = exp(-vSide * vSide * 9.0);
    float lit = 1.0 - smoothstep(uHead - 0.004, uHead + 0.004, vAlong);
    // unlit, it is a dotted hint of where the signal will go
    float dots = step(0.55, fract(vAlong * uLen * 2.2 - uTime * 0.12));
    // soften both ends, so a beam grows out of its via and into the next
    float ends = smoothstep(0.0, 0.04, vAlong) * (1.0 - smoothstep(0.96, 1.0, vAlong));
    float hair = 1.0 - smoothstep(0.0, 0.05, abs(vSide));
    vec3 col = uIdle * hair * dots * 0.5 * (1.0 - lit);
    col += uLit * lit * (core * 1.05 + halo * 0.3);
    gl_FragColor = vec4(col * ends * uAlpha, 0.0);
  }
`

// A quad that faces the camera: the signal itself, and each cloud.
const SPRITE_VERT = /* glsl */ `
  attribute vec3 aCentre;
  attribute vec2 aSize;
  attribute float aSeed;
  uniform float uScale;
  varying vec2 vUv;
  varying float vSeed;
  void main() {
    vec4 mv = viewMatrix * vec4(aCentre, 1.0);
    mv.xy += position.xy * aSize * uScale;
    vUv = position.xy + 0.5;
    vSeed = aSeed;
    gl_Position = projectionMatrix * mv;
  }
`

const SIGNAL_FRAG = /* glsl */ `
  uniform vec3 uLit;
  uniform float uAlpha;
  varying vec2 vUv;
  void main() {
    float r = length(vUv - 0.5) * 2.0;
    float core = exp(-r * r * 130.0);
    float halo = exp(-r * r * 9.0) * 0.5;
    float wide = exp(-r * r * 2.6) * 0.12;
    vec3 col = uLit * (halo + wide) + vec3(1.0, 0.97, 0.9) * core * 1.4;
    gl_FragColor = vec4(col * uAlpha * (1.0 - smoothstep(0.85, 1.0, r)), 0.0);
  }
`

const CLOUD_FRAG = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uAlpha;
  uniform vec3 uTint;
  varying vec2 vUv;
  varying float vSeed;
  void main() {
    // each cloud reads a different corner of the same puff
    vec2 uv = vSeed > 0.5 ? vec2(1.0 - vUv.x, vUv.y) : vUv;
    float a = texture2D(uMap, uv).a * uAlpha * (0.55 + 0.45 * fract(vSeed * 7.3));
    gl_FragColor = vec4(uTint * a, a);
  }
`

const DUST_VERT = /* glsl */ `
  attribute float aSeed;
  uniform float uTime;
  uniform float uPx;
  varying float vFade;
  void main() {
    vec3 p = position;
    p.x += sin(uTime * 0.07 + aSeed * 40.0) * 0.5;
    p.y += sin(uTime * 0.05 + aSeed * 17.0) * 0.6;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = uPx * (0.6 + aSeed) * 26.0 / -mv.z;
    vFade = (1.0 - smoothstep(30.0, 120.0, -mv.z)) * (0.35 + 0.65 * aSeed);
    gl_Position = projectionMatrix * mv;
  }
`

const DUST_FRAG = /* glsl */ `
  uniform vec3 uTint;
  uniform float uAlpha;
  varying float vFade;
  void main() {
    float r = length(gl_PointCoord - 0.5) * 2.0;
    float a = (1.0 - smoothstep(0.2, 1.0, r)) * vFade * uAlpha;
    gl_FragColor = vec4(uTint * a, 0.0);
  }
`

const SKY_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = position.xy * 0.5 + 0.5;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`

const SKY_FRAG = /* glsl */ `
  uniform vec3 uTop;
  uniform vec3 uBottom;
  uniform vec3 uHaze;
  uniform vec2 uCentre;
  uniform float uAspect;
  varying vec2 vUv;
  void main() {
    vec3 col = mix(uBottom, uTop, smoothstep(0.0, 1.0, vUv.y));
    // a breath of light behind the stack, so it never sits on a flat ground
    vec2 q = (vUv - uCentre) * vec2(uAspect, 1.0);
    col += uHaze * exp(-dot(q, q) * 3.2);
    // one bit of noise: a dark gradient bands on an 8 bit screen without it
    float n = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
    gl_FragColor = vec4(col + (n - 0.5) / 255.0 * 1.6, 1.0);
  }
`

// premultiplied "over", which also lets a shader add light by writing colour
// with no alpha: one blend mode for the glass and the glow both
const BLEND = {
  transparent: true,
  depthTest: false,
  depthWrite: false,
  blending: THREE.CustomBlending,
  blendSrc: THREE.OneFactor,
  blendDst: THREE.OneMinusSrcAlphaFactor,
} as const

// --- the scene -----------------------------------------------------------------

interface Floor {
  y: number
  path: Pt[]
  length: number
  exit: Pt
  mesh: THREE.Mesh
  uniforms: Record<string, THREE.IUniform>
  built: boolean
}

export async function startRide(canvas: HTMLCanvasElement, opts: RideOptions): Promise<Ride> {
  // The plates are lettered in the page's own faces. A canvas draws with a
  // fallback if the font has not arrived, so wait for the ones it uses.
  await Promise.all(['500 16px "JetBrains Mono"', '400 16px "JetBrains Mono"'].map((f) => document.fonts.load(f).catch(() => [])))

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: !opts.lite,
    alpha: false,
    depth: false,
    stencil: false,
    powerPreference: 'high-performance',
  })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, opts.lite ? 1.75 : 2))
  renderer.setClearColor(0x020a09, 1)

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.5, 900)

  const uTime = { value: 0 }
  const uFog = { value: new THREE.Vector3() }
  const uFogRange = { value: new THREE.Vector2(40, 110) }
  const uLit = { value: rgb('#ffd27a') }

  const disposables: { dispose: () => void }[] = []
  const keep = <T extends { dispose: () => void }>(thing: T) => { disposables.push(thing); return thing }

  // --- the sky behind everything
  const skyUniforms = {
    uTop: { value: new THREE.Vector3() },
    uBottom: { value: new THREE.Vector3() },
    uHaze: { value: new THREE.Vector3() },
    uCentre: { value: new THREE.Vector2(0.5, 0.5) },
    uAspect: { value: 1 },
  }
  const skyGeo = keep(new THREE.BufferGeometry())
  skyGeo.setAttribute('position', new THREE.Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3))
  const sky = new THREE.Mesh(skyGeo, keep(new THREE.ShaderMaterial({ uniforms: skyUniforms, vertexShader: SKY_VERT, fragmentShader: SKY_FRAG, depthTest: false, depthWrite: false })))
  sky.frustumCulled = false
  sky.renderOrder = -100
  scene.add(sky)

  // --- the floors
  const artRes = opts.lite ? 1024 : 2048
  const flowRes = opts.lite ? 512 : 1024
  const anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy())
  const blank = keep(new THREE.DataTexture(new Uint8Array(4), 1, 1))
  blank.needsUpdate = true
  const plateGeo = keep(new THREE.PlaneGeometry(PLATE, PLATE))
  plateGeo.rotateX(-Math.PI / 2)

  const floors: Floor[] = PLATES.map((spec, i) => {
    const uniforms: Record<string, THREE.IUniform> = {
      uArt: { value: blank },
      uFlow: { value: blank },
      uTime,
      uFog,
      uFogRange,
      uLit,
      uHead: { value: -1 },
      uAlpha: { value: 0 },
      uGain: { value: 1 },
      uBoot: { value: i === 0 && !opts.still ? 0 : 1 },
      uTorch: { value: 0 },
      uPointer: { value: new THREE.Vector2(99, 99) },
      uOrigin: { value: new THREE.Vector2(spec.path[0][0], spec.path[0][1]) },
      uMask: { value: rgb(spec.palette.mask) },
      uRim: { value: rgb(spec.palette.rim) },
    }
    const material = keep(new THREE.ShaderMaterial({ uniforms, vertexShader: PLATE_VERT, fragmentShader: PLATE_FRAG, side: THREE.DoubleSide, ...BLEND }))
    const mesh = new THREE.Mesh(plateGeo, material)
    mesh.position.y = i * GAP
    mesh.renderOrder = i
    mesh.visible = false
    scene.add(mesh)
    return { y: i * GAP, path: spec.path, length: lengthOf(spec.path), exit: spec.path[spec.path.length - 1], mesh, uniforms, built: false }
  })

  const asTexture = (source: HTMLCanvasElement, mipmaps: boolean) => {
    const texture = keep(new THREE.CanvasTexture(source))
    texture.colorSpace = THREE.NoColorSpace
    texture.premultiplyAlpha = true
    texture.generateMipmaps = mipmaps
    texture.minFilter = mipmaps ? THREE.LinearMipmapLinearFilter : THREE.LinearFilter
    texture.magFilter = THREE.LinearFilter
    texture.anisotropy = mipmaps ? anisotropy : 1
    renderer.initTexture(texture)
    return texture
  }

  // Drawing a floor takes a few tens of milliseconds, so only the first is
  // drawn up front. The rest are drawn in the gaps while the reader is still
  // looking at the first, and on the spot if they get there sooner.
  const build = (i: number) => {
    const floor = floors[i]
    if (!floor || floor.built) return
    const pen = drawPlate(i, artRes, flowRes)
    floor.uniforms.uArt.value = asTexture(pen.art, true)
    floor.uniforms.uFlow.value = asTexture(pen.flow, false)
    floor.built = true
  }
  build(0)
  let idle = 0
  const buildNext = () => {
    const next = floors.findIndex((f) => !f.built)
    if (next < 0) return
    build(next)
    idle = window.setTimeout(buildNext, 180)
  }
  idle = window.setTimeout(buildNext, 700)

  // --- the climbs between floors, and the last one into the sky
  const beamGeo = keep(new THREE.BufferGeometry())
  beamGeo.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0], 3))
  beamGeo.setAttribute('aSide', new THREE.Float32BufferAttribute([-1, 1, -1, 1], 1))
  beamGeo.setAttribute('aAlong', new THREE.Float32BufferAttribute([0, 0, 1, 1], 1))
  beamGeo.setIndex([0, 1, 2, 2, 1, 3])
  const beams = floors.map((floor, i) => {
    const rise = i === FLOORS - 1 ? SKY_RISE : GAP
    const uniforms = {
      uHead: { value: 0 },
      uLen: { value: rise },
      uAlpha: { value: 0 },
      uWidth: { value: 0.34 },
      uTime,
      uLit,
      uIdle: { value: rgb(PLATES[i].palette.rim) },
    }
    const mesh = new THREE.Mesh(beamGeo, keep(new THREE.ShaderMaterial({ uniforms, vertexShader: BEAM_VERT, fragmentShader: BEAM_FRAG, side: THREE.DoubleSide, ...BLEND })))
    mesh.position.set(floor.exit[0], floor.y, floor.exit[1])
    mesh.scale.y = rise
    mesh.frustumCulled = false
    mesh.renderOrder = 20
    scene.add(mesh)
    return { uniforms, rise }
  })

  // --- four hairlines up the corners, so the floors read as one tower
  const postGeo = keep(new THREE.BufferGeometry())
  const corner = 5.82
  const top = (FLOORS - 1) * GAP + 1.5
  postGeo.setAttribute('position', new THREE.Float32BufferAttribute(
    [[-1, -1], [1, -1], [1, 1], [-1, 1]].flatMap(([x, z]) => [x * corner, -2.5, z * corner, x * corner, top, z * corner]), 3))
  const postMaterial = keep(new THREE.LineBasicMaterial({ color: 0x5eead4, transparent: true, opacity: 0.13, depthTest: false, depthWrite: false }))
  const posts = new THREE.LineSegments(postGeo, postMaterial)
  posts.renderOrder = -10
  scene.add(posts)

  // --- dust in the air: nothing sells depth like something drifting in it
  const DUST = opts.lite ? 260 : 520
  const dustPos = new Float32Array(DUST * 3)
  const dustSeed = new Float32Array(DUST)
  // a fixed sequence rather than Math.random, so the scene is the same scene
  // on every visit
  let seed = 7
  const rand = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647 }
  for (let i = 0; i < DUST; i++) {
    dustPos[i * 3] = (rand() - 0.5) * 44
    dustPos[i * 3 + 1] = -6 + rand() * ((FLOORS - 1) * GAP + 22)
    dustPos[i * 3 + 2] = (rand() - 0.5) * 44
    dustSeed[i] = rand()
  }
  const dustGeo = keep(new THREE.BufferGeometry())
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3))
  dustGeo.setAttribute('aSeed', new THREE.BufferAttribute(dustSeed, 1))
  const dustUniforms = { uTime, uPx: { value: 1 }, uTint: { value: rgb('#9fe8dc') }, uAlpha: { value: 0.5 } }
  const dust = new THREE.Points(dustGeo, keep(new THREE.ShaderMaterial({ uniforms: dustUniforms, vertexShader: DUST_VERT, fragmentShader: DUST_FRAG, ...BLEND })))
  dust.frustumCulled = false
  dust.renderOrder = 25
  scene.add(dust)

  // --- the signal
  const quad = (count: number) => {
    const geo = keep(new THREE.InstancedBufferGeometry())
    geo.setAttribute('position', new THREE.Float32BufferAttribute([-0.5, -0.5, 0, 0.5, -0.5, 0, -0.5, 0.5, 0, 0.5, 0.5, 0], 3))
    geo.setIndex([0, 1, 2, 2, 1, 3])
    geo.instanceCount = count
    return geo
  }
  const signalGeo = quad(1)
  const signalCentre = new THREE.InstancedBufferAttribute(new Float32Array(3), 3)
  signalGeo.setAttribute('aCentre', signalCentre)
  signalGeo.setAttribute('aSize', new THREE.InstancedBufferAttribute(new Float32Array([1, 1]), 2))
  signalGeo.setAttribute('aSeed', new THREE.InstancedBufferAttribute(new Float32Array([0]), 1))
  const signalUniforms = { uLit, uAlpha: { value: 1 }, uScale: { value: 2.6 } }
  const signal = new THREE.Mesh(signalGeo, keep(new THREE.ShaderMaterial({ uniforms: signalUniforms, vertexShader: SPRITE_VERT, fragmentShader: SIGNAL_FRAG, ...BLEND })))
  signal.frustumCulled = false
  signal.renderOrder = 30
  scene.add(signal)

  // --- the clouds the signal leaves through
  const CLOUDS = opts.lite ? 26 : 44
  const puff = document.createElement('canvas')
  puff.width = puff.height = 256
  {
    const c = puff.getContext('2d')!
    // a cloud is a few soft discs that overlap: a wide flat base, a taller middle
    for (const [x, y, r, a] of [[128, 150, 92, 0.5], [84, 156, 62, 0.42], [176, 154, 66, 0.42], [118, 118, 60, 0.4], [156, 126, 48, 0.34], [56, 166, 40, 0.3], [204, 164, 40, 0.3]]) {
      const g = c.createRadialGradient(x, y, 0, x, y, r)
      g.addColorStop(0, `rgba(255,255,255,${a})`)
      g.addColorStop(0.55, `rgba(255,255,255,${a * 0.5})`)
      g.addColorStop(1, 'rgba(255,255,255,0)')
      c.fillStyle = g
      c.fillRect(0, 0, 256, 256)
    }
  }
  const cloudGeo = quad(CLOUDS)
  const cloudCentre = new Float32Array(CLOUDS * 3)
  const cloudSize = new Float32Array(CLOUDS * 2)
  const cloudSeed = new Float32Array(CLOUDS)
  const deck = (FLOORS - 1) * GAP + 9
  for (let i = 0; i < CLOUDS; i++) {
    const a = rand() * Math.PI * 2
    const r = 9 + rand() * 46
    cloudCentre[i * 3] = Math.cos(a) * r
    cloudCentre[i * 3 + 1] = deck + rand() * (SKY_RISE - 2)
    cloudCentre[i * 3 + 2] = Math.sin(a) * r
    const s = 16 + rand() * 26
    cloudSize[i * 2] = s
    cloudSize[i * 2 + 1] = s * (0.55 + rand() * 0.2)
    cloudSeed[i] = rand()
  }
  cloudGeo.setAttribute('aCentre', new THREE.InstancedBufferAttribute(cloudCentre, 3))
  cloudGeo.setAttribute('aSize', new THREE.InstancedBufferAttribute(cloudSize, 2))
  cloudGeo.setAttribute('aSeed', new THREE.InstancedBufferAttribute(cloudSeed, 1))
  const cloudUniforms = { uMap: { value: asTexture(puff, true) }, uAlpha: { value: 0 }, uScale: { value: 1 }, uTint: { value: new THREE.Vector3(1, 1, 1) } }
  const clouds = new THREE.Mesh(cloudGeo, keep(new THREE.ShaderMaterial({ uniforms: cloudUniforms, vertexShader: SPRITE_VERT, fragmentShader: CLOUD_FRAG, ...BLEND })))
  clouds.frustumCulled = false
  clouds.renderOrder = 40
  scene.add(clouds)

  // --- state the page drives
  let time = 0 // beats
  let width = 1
  let height = 1
  let pointerX = 0
  let pointerY = 0
  let pointerOver = false
  let swayX = 0
  let swayY = 0
  let torch = 0
  let started = 0
  let last = 0
  const target = new THREE.Vector3()
  const probe = new THREE.Vector3()

  // Where the signal is at a given beat, and how much of each floor's route
  // and each climb it has lit on the way there.
  const head = { x: 0, y: 0, z: 0, floor: 0 }
  const locate = (t: number) => {
    for (let i = 0; i < FLOORS; i++) {
      const floor = floors[i]
      const { from, to } = travel(i)
      const leaves = i === FLOORS - 1 ? T_END : travel(i + 1).from
      const across = t < from ? (i === 0 ? 0 : -1) : t >= to ? 2 : ease(ramp(t, from, to))
      const up = t < to ? 0 : t >= leaves ? 1.5 : ease(ramp(t, to, leaves))
      floor.uniforms.uHead.value = across
      beams[i].uniforms.uHead.value = up
      if (t < to && (i === 0 || t >= travel(i - 1).to)) {
        if (t >= from || i === 0) {
          const [x, z] = pointAt(floor.path, Math.max(0, across) * floor.length)
          head.x = x; head.y = floor.y; head.z = z; head.floor = i
        }
      } else if (t >= to && t < leaves) {
        head.x = floor.exit[0]; head.z = floor.exit[1]
        head.y = floor.y + Math.min(1, up) * beams[i].rise
        head.floor = i + (up > 0.5 ? 1 : 0)
      }
    }
    if (t >= T_END) {
      const lastFloor = floors[FLOORS - 1]
      head.x = lastFloor.exit[0]; head.z = lastFloor.exit[1]; head.y = lastFloor.y + SKY_RISE; head.floor = FLOORS
    }
  }

  const frame = (now: number) => {
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016
    last = now
    if (!started) started = now
    const t = time
    locate(t)

    uTime.value = opts.still ? 0 : now / 1000
    floors[0].uniforms.uBoot.value = opts.still ? 1 : ease(ramp(now - started, 150, 1900))

    // the three acts: on the board, up the stack, out through the clouds
    const intro = 1 - ease(ramp(t, 0.04, 0.95))
    const climb = ease(ramp(t, SKY_FROM + 0.04, T_END - 0.3))
    const wide = width >= 880 && width / height > 1.05

    // --- colour of the space, by altitude
    let k = 0
    while (k < SKY.length - 2 && t > SKY[k + 1][0]) k++
    const u = ease(ramp(t, SKY[k][0], SKY[k + 1][0]))
    skyUniforms.uBottom.value.lerpVectors(SKY[k][1], SKY[k + 1][1], u)
    skyUniforms.uTop.value.lerpVectors(SKY[k][2], SKY[k + 1][2], u)
    uFog.value.lerpVectors(skyUniforms.uBottom.value, skyUniforms.uTop.value, 0.45)
    skyUniforms.uHaze.value.set(0.03, 0.09, 0.085).multiplyScalar(1 - climb)
    skyUniforms.uAspect.value = width / height

    // --- which floors can be seen, and how brightly
    for (let i = 0; i < FLOORS; i++) {
      const floor = floors[i]
      const above = head.y - floor.y // how far the signal is above this floor
      const alpha = ease(ramp(above, -GAP * 0.92, -GAP * 0.22)) * (1 - ease(ramp(t, T_END - 0.75, T_END - 0.3)))
      floor.mesh.visible = alpha > 0.002
      if (floor.mesh.visible) build(i)
      floor.uniforms.uAlpha.value = alpha
      // a floor already passed sinks back: it is context now, not the subject
      floor.uniforms.uGain.value = above <= 0 ? 1 : Math.exp(-(above / GAP) * 0.8)
      const beam = beams[i]
      beam.uniforms.uAlpha.value = ease(ramp(above, -GAP * 0.4, 0)) * (i === FLOORS - 1 ? 1 - ease(ramp(t, T_END - 1.0, T_END - 0.68)) : 1)
    }
    postMaterial.opacity = 0.13 * (1 - climb)

    // --- the camera
    const lerp3 = (a: number, b: number, c: number) => mix(mix(b, a, intro), c, climb)
    const elevation = (wide ? lerp3(26, 38, -5) : lerp3(30, 43, -5)) * DEG
    const drift = Math.sin(head.y / GAP * 0.9) * 4
    const azimuth = (wide ? lerp3(-39, -29, -24) : lerp3(-24, -18, -16)) * DEG + drift * DEG * (1 - intro)
    // how many pixels the plate's 17 unit diagonal should span
    const span = wide
      ? lerp3(Math.min(0.84 * width, 1.62 * height), Math.min(0.56 * width, 1.08 * height), Math.min(0.56 * width, 1.08 * height))
      : lerp3(Math.min(1.62 * width, 0.86 * height), Math.min(1.4 * width, 0.74 * height), Math.min(1.4 * width, 0.74 * height))
    const distance = (height / 2) / ((span / 17) * Math.tan((FOV * DEG) / 2))
    // where on the stage the stack sits: beside the words, or above them
    // a narrower window has less room between the words and the gauge, and
    // a shorter phone less room above the caption: the stack gives way
    const cx = wide ? lerp3(0.73, width < 1300 ? 0.67 : 0.645, 0.5) : 0.5
    const cy = wide ? lerp3(0.6, 0.53, 0.5) : lerp3(0.68, height < 720 ? 0.29 : 0.35, 0.46)
    camera.setViewOffset(width, height, -(cx - 0.5) * width, -(cy - 0.5) * height, width, height)
    skyUniforms.uCentre.value.set(cx, 1 - cy)

    // ease the pointer in, so the stack leans rather than twitches
    const follow = 1 - Math.exp(-dt * 5)
    swayX += ((pointerOver ? pointerX : 0) - swayX) * follow
    swayY += ((pointerOver ? pointerY : 0) - swayY) * follow
    torch += ((pointerOver ? 1 : 0) - torch) * (1 - Math.exp(-dt * 6))
    const still = opts.still ? 0 : 1
    const az = azimuth + (swayX * 2.4 + Math.sin(now / 9000) * 0.9 * still) * DEG
    const el = elevation - swayY * 1.5 * DEG

    // on the last climb the camera stops keeping up, so the signal rises out
    // of the top of the frame instead of hanging in the middle of it
    target.set(head.x * 0.3, head.y - climb * climb * 15, head.z * 0.3)
    camera.position.set(
      target.x + distance * Math.cos(el) * Math.sin(az),
      target.y + distance * Math.sin(el),
      target.z + distance * Math.cos(el) * Math.cos(az),
    )
    camera.lookAt(target)
    camera.updateMatrixWorld()
    uFogRange.value.set(distance + 4, distance + 30)

    // --- the pointer as a torch on the floor the signal is on
    const active = Math.min(FLOORS - 1, head.floor)
    probe.set(pointerX, -pointerY, 0.5).unproject(camera).sub(camera.position)
    const hit = probe.y !== 0 ? (floors[active].y - camera.position.y) / probe.y : -1
    for (let i = 0; i < FLOORS; i++) {
      const on = i === active && hit > 0
      floors[i].uniforms.uTorch.value = on ? torch : 0
      if (on) floors[i].uniforms.uPointer.value.set(camera.position.x + probe.x * hit, camera.position.z + probe.z * hit)
    }

    // --- the signal, the dust, the clouds
    signalCentre.setXYZ(0, head.x, head.y + 0.02, head.z)
    signalCentre.needsUpdate = true
    const breathe = opts.still ? 1 : 1 + Math.sin(now / 260) * 0.07
    signalUniforms.uScale.value = mix(2.6, 5, climb) * breathe
    signalUniforms.uAlpha.value = floors[0].uniforms.uBoot.value * (1 - ease(ramp(t, T_END - 0.95, T_END - 0.6)))
    dustUniforms.uPx.value = renderer.getPixelRatio() * (height / 900)
    dustUniforms.uAlpha.value = 0.5 * (1 - climb)
    cloudUniforms.uAlpha.value = ease(ramp(t, SKY_FROM + 0.1, SKY_FROM + 0.7))

    renderer.render(scene, camera)
  }

  return {
    seek: (t) => { time = Math.max(0, Math.min(T_END, t)) },
    point: (x, y, over) => { pointerX = x; pointerY = y; pointerOver = over },
    resize: (w, h) => {
      width = Math.max(1, w)
      height = Math.max(1, h)
      renderer.setSize(width, height, false)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
    },
    render: frame,
    dispose: () => {
      window.clearTimeout(idle)
      for (const thing of disposables) thing.dispose()
      renderer.dispose()
    },
  }
}
