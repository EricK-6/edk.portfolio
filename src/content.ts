// Everything the site says about me, in one place.
//
// Each section used to keep its own copy of its data, and so did the terminal
// and the command palette — so they drifted. The terminal's skills list was
// missing Docker, Terraform, ROS and Spring Boot months after the Skills
// section gained them, and About's "4 certifications" and "8 projects" were
// typed in by hand. Now the sections, the terminal, the palette and the counts
// all read from here: edit a line once and every place that shows it agrees.

// --- me ----------------------------------------------------------------------

export const PROFILE = {
  name: 'Eric Kim',
  fullName: 'Dohyun (Eric) Kim',
  email: 'dohyunkim290106@gmail.com',
  github: { handle: 'EricK-6', url: 'https://github.com/EricK-6' },
  linkedin: { handle: 'erick06', url: 'https://www.linkedin.com/in/erick06/' },
  // the source of this site, which the footer's "last updated" links to
  repo: 'https://github.com/EricK-6/edk.portfolio',
  city: 'Auckland, NZ',
  timeZone: 'Pacific/Auckland',
}

// The two résumés. `aliases` are the words people type for each one, in the
// terminal and in a guessed URL like /cv/hardware.
export const RESUMES = [
  { id: 'software', label: 'Software', href: './CV_SWE.pdf', aliases: ['software', 'swe', 'sw', 'soft'] },
  { id: 'hardware', label: 'Hardware', href: './CV_EEE.pdf', aliases: ['hardware', 'eee', 'hw', 'electrical', 'electronics'] },
] as const

export type ResumeId = (typeof RESUMES)[number]['id']

// --- intro -------------------------------------------------------------------

// The rotating end of "Kia ora, I build …". Each one is a project further down
// the page, said the way you would say it out loud.
export const HERO_PHRASES = [
  'embedded systems',
  'robots that hold your gaze',
  'fraud detection that cites its evidence',
  'serverless pipelines on AWS',
  'a website a whole club runs on',
  'energy meters on a custom PCB',
  'a Flappy Bird in pure VHDL',
  'dashboards that forecast the quarter',
  'meal planners for Android',
]

// --- projects ----------------------------------------------------------------

// A build log is the case study behind a project, opened from its card.
// Entries read top to bottom: BRIEF, then whatever the story needs, then
// OUTCOME. `flow` draws a pipeline as a numbered list of stages above the
// entry's text: what each service is, then the one thing it does there.
//
// Copy rule for everything shown on the page: no em or en dashes. Colons,
// commas and full stops do that job, the same as on the CV.
export interface BuildLogEntry {
  code: string
  flow?: { node: string; does: string }[]
  body: string[]
}

export interface ProjectLink {
  label: string
  href: string
}

export interface Project {
  title: string
  // the anchor (erickk.cloud/#spottern), the terminal's directory name and
  // the analytics event suffix: lowercase, hyphenated, never renamed lightly
  slug: string
  // one line in the terminal's voice, for `ls -l` and search results
  blurb: string
  tag?: string
  year: string
  period?: string
  org?: string
  awardedBy?: string[]
  hostedBy?: string[]
  role: string
  highlights?: string[]
  tech?: string[]
  image?: string
  video?: string
  aspect?: string
  focus?: string
  featured?: boolean
  rank?: string
  icon?: string
  links: ProjectLink[]
  log?: BuildLogEntry[]
}

// Awards first: the two placements are the feature rows, the rest the grid.
// `**bold**` in a highlight is the same emphasis About uses, mirroring what
// the CV bolds — at most two short runs a bullet.
export const PROJECTS: Project[] = [
  {
    title: 'Winnie the Bot',
    slug: 'winnie-the-bot',
    blurb: 'AI interactive robot · dual ATmega328P · 3rd place ECSE',
    tag: '3rd Place · ECSE Design Competition 2025',
    year: '2025',
    period: 'Sep 2025',
    // bracketed short form keys the logo, so the ECSE department credit still
    // flies the University of Auckland mark
    awardedBy: ['Department of Electrical, Computer and Software Engineering (UoA)'],
    role: 'Interactive Companion Robot',
    highlights: [
      'Designed and built the embedded electrical hardware for an AI powered interviewer robot using **dual ATmega328P NANO** microcontrollers, servos, an AI camera, and audio peripherals to drive simultaneous face tracking, arm movement, and real time voice interaction.',
      "Prototyped and refined the robot's enclosure through **iterative 3D printing** and multiple design revisions, delivering a compact, durable, and functional physical build that **placed 3rd** in the UoA ECSE Design Competition.",
    ],
    tech: ['Embedded C', 'ATmega328P NANO', 'Servos', 'AI Camera', 'AutoCAD'],
    image: './winnie.webp',
    video: './winnie.mp4',
    featured: true,
    rank: '3rd',
    links: [],
    // deeper case study shown in the build-log modal
    log: [
      {
        code: '01 · BRIEF',
        body: [
          'Build a companion robot for the UoA ECSE Design Competition 2025 that can hold your gaze, wave, and talk back. An embedded system that reads as a character, not a circuit board.',
        ],
      },
      {
        code: '02 · BUILD',
        body: [
          'Dual ATmega328P NANOs share the workload across servos for head and arm motion, an AI camera for face tracking, and audio peripherals for voice dialogue, all running simultaneously on hardware with no operating system underneath.',
          'The enclosure was 3D modelled and printed across multiple design revisions, packing every board, servo, and speaker into a compact, durable, desk-friendly form factor.',
        ],
      },
      {
        code: '03 · SETBACK',
        body: [
          "The enclosure fought back at the CAD stage. Winnie's parts are doll sized, small enough that measuring them by eye was hopeless and their true dimensions were genuinely hard to pin down.",
          'The fix was proper metrology: vernier calipers and lab grade measurement equipment, one component at a time, recording actual sizes until the numbers could be trusted. Those measurements became the 3D CAD model the final enclosure was built from.',
        ],
      },
      {
        code: '04 · OUTCOME',
        body: [
          '3rd place at the UoA ECSE Design Competition 2025, awarded by the Department of ECSE in September 2025.',
        ],
      },
    ],
  },
  {
    title: 'Spottern!',
    slug: 'spottern',
    blurb: 'Statement-level fraud detection on AWS · top 8 AWS×BNZ hackathon',
    tag: 'Top 8 Finalist · AWS×BNZ AI Hackathon 2026',
    year: '2026',
    period: 'Jul 2026',
    role: 'Statement-level Fraud Detection Platform',
    awardedBy: [
      'Amazon Web Services (AWS)',
      'Bank of New Zealand (BNZ)',
    ],
    highlights: [
      'Built a serverless fraud pipeline with **AWS (SNS, Lambda, Textract, Bedrock, DynamoDB)**, using Claude Opus 4.8 on Bedrock behind a **schema validated JSON contract**, to extract and flag anomalies across an entire bank statement in one call with cited transaction evidence.',
      'Proposed the approach to **BNZ** by drawing on prior individual project experience with serverless AWS pipelines, placing **top 8 out of 20+ teams**.',
    ],
    tech: ['AWS Lambda', 'Amazon Textract', 'Amazon Bedrock', 'Claude Opus 4.8', 'DynamoDB', 'Amazon S3', 'Amazon SNS', 'AWS SAM', 'React.js'],
    image: './spottern.webp', // also the video's poster
    video: './spottern.mp4',
    // 2940x1436. A dashboard is the one thing you cannot crop — a slice off
    // each end takes the readout with it — so this clip keeps its own shape
    // instead of being fitted to the row, and centres against the text beside
    // it. Everything else has no `aspect` and fills the row normally.
    aspect: 'aspect-[2940/1436]',
    featured: true,
    rank: 'Top 8',
    links: [
      { label: 'Deployed DEMO', href: 'https://erick-6.github.io/Spottern/' },
      { label: 'Git repo', href: 'https://github.com/EricK-6/Spottern' },
    ],
    log: [
      {
        code: '01 · BRIEF',
        body: [
          'The AWS×BNZ AI Hackathon 2026, AI Innovation challenge. Spottern reads a whole bank statement, sorts the spending into categories, and flags anything unusual with a plain-language reason a customer can act on.',
        ],
      },
      {
        code: '02 · TEAM',
        body: [
          'I was grouped with two people I had never met. I volunteered to lead, and before splitting anything up I met each of them one to one to find out where they were strongest. One had really strong front-end skills, the other had real experience presenting, so I divided the work along those lines and took the AWS pipeline myself. Throughout, I made a point of listening to their ideas rather than just handing out tasks.',
        ],
      },
      {
        code: '03 · ARCHITECTURE',
        flow: [
          { node: 'S3 · API Gateway', does: 'a PDF upload or a CSV post starts a run' },
          { node: 'Textract', does: 'lifts the transaction table out of a PDF statement' },
          { node: 'Bedrock · Claude Opus 4.8', does: 'reads the whole statement in one call' },
          { node: 'DynamoDB', does: 'stores every enriched transaction' },
          { node: 'SNS · SES', does: 'alerts BNZ fraud-ops and the customer' },
        ],
        body: [
          'The whole statement goes to the model at once, because duplicates and out-of-pattern spending only show up in context: labelling one transaction at a time would miss both.',
          'The answer is held to a contract. A forced tool call with a JSON schema returns a category from a fixed list, a flag, a 0 to 1 score and a plain-language reason for every transaction, and the merge step still clamps anything out of range, so a bad verdict can never corrupt a stored record. Every stage reads and writes one shared transaction schema.',
        ],
      },
      {
        code: '04 · SETBACK',
        body: [
          "Bedrock was the wall. On the university's AWS account, calling Claude through InvokeModel was blocked by an AWS Marketplace subscription policy that only an org admin could lift. The Converse API was allowed, so I moved the categorize Lambda onto Converse and enforced the structured output with that forced tool call instead. The stack is pinned to Sydney, the only region Bedrock was reachable from on that account, and the au. inference profile keeps a bank statement's data in Australia.",
          'So the demo could never depend on any of that, the frontend falls back to three sample statements with fraud planted in them: an overseas buy and a duplicate charge, card testing, and a crypto and transfer scam. The hosted demo runs on those.',
        ],
      },
      {
        code: '05 · OUTCOME',
        body: [
          "Top 8 of 20+ teams. We finished before the deadline and were invited to BNZ's office to present to the panel as finalists.",
        ],
      },
    ],
  },
  {
    title: 'Sentiment PULSE',
    slug: 'sentiment-pulse',
    blurb: 'Serverless NLP pipeline on AWS + live React dashboard',
    icon: 'cloud',
    tag: 'AWS · Individual Project',
    year: '2026',
    period: 'May 2026 to Jun 2026',
    role: 'Real-time Sentiment Dashboard',
    highlights: [
      'Built a serverless NLP pipeline with **AWS (Kinesis, Lambda, Comprehend, DynamoDB)** using AWS SAM, with a dead letter queue for failed batches, to classify streaming text sentiment in real time.',
      'Developed a **live React dashboard** on AWS Amplify, applying cloud and AI/ML fundamentals from certification study to a hands on project.',
    ],
    tech: ['Amazon Kinesis', 'AWS Lambda', 'Amazon Comprehend', 'DynamoDB', 'AWS SAM', 'GitHub Actions', 'React.js', 'AWS Amplify'],
    image: './pulse.webp',
    video: './pulse.mp4',
    links: [
      { label: 'Deployed DEMO', href: 'https://master.d1vwgts5qfrat7.amplifyapp.com/' },
      { label: 'Git repo', href: 'https://github.com/EricK-6/sentiment-dashboard' },
    ],
    log: [
      {
        code: '01 · BRIEF',
        body: [
          'A solo project to put certification study into practice: stream text in, classify its sentiment with a managed NLP service, and watch the mood move on a live dashboard, with every piece of it defined as code.',
        ],
      },
      {
        code: '02 · ARCHITECTURE',
        flow: [
          { node: 'Kinesis', does: 'a local producer streams reviews into one shard' },
          { node: 'Lambda · SentimentProcessor', does: 'reads the stream in batches of ten' },
          { node: 'Comprehend', does: 'one BatchDetectSentiment call per batch, not per record' },
          { node: 'DynamoDB', does: "results keyed by the producer's UUID, plus a ByTimestamp index" },
          { node: 'API Gateway · Lambda', does: 'a bounded query for the latest records' },
          { node: 'React on Amplify', does: 'polls every five seconds' },
        ],
        body: [
          'The whole stack is one AWS SAM template: the stream, both Lambdas, the table, the API and the dead letter queue.',
        ],
      },
      {
        code: '03 · FAILURE MODES',
        body: [
          "The first version worked end to end and was still wrong twice over. Kinesis delivers at least once, so a retried batch could write the same review twice, and every five-second poll scanned the entire table. Carrying the producer's UUID as the table key made retries idempotent, and the ByTimestamp index turned \"latest N\" into a bounded query instead of a scan.",
          'Then the stream itself. One bad record used to fail its whole batch. The handler now reports only the records that failed (a partial batch response), so the rest are checkpointed; a batch that keeps failing is split in half, and whatever still fails after two retries lands in an SQS dead letter queue for 14 days instead of disappearing.',
        ],
      },
      {
        code: '04 · COST',
        body: [
          'The Kinesis shard bills about $11 a month whether or not anything flows, and it has no free tier. So the backend is deployed on demand and deleted when idle (one sam delete takes it to $0), and the dashboard switches to a built-in simulation whenever the API is unreachable. The demo linked here runs on that simulation.',
        ],
      },
      {
        code: '05 · OUTCOME',
        body: [
          '21 frontend tests (Vitest) and 8 backend tests (pytest with moto) run on every push through GitHub Actions.',
          'What I would change at real volume: the ByTimestamp index puts every record in one partition, which is fine for a demo and a hot partition at scale, so I would shard it.',
        ],
      },
    ],
  },
  {
    title: 'KEB Web Design',
    slug: 'keb-web-design',
    blurb: "KEB's first ever club website · React 19 + Vite",
    icon: 'globe',
    tag: 'KEB Project Playground 2025 · Team Competition',
    year: '2025',
    period: 'Aug 2025',
    role: 'Homepage for Club',
    hostedBy: ['Korean Engineering Body (KEB)'],
    highlights: [
      "Delivered the Korean Engineering Body's **first-ever website** using React 19, Vite, and React Bootstrap, giving the club a centralised hub for events and activities.",
      'Collaborated with senior software students to ship a **production-ready platform** from scratch.',
    ],
    tech: ['HTML/CSS', 'JavaScript', 'React.js', 'Node.js'],
    image: './KEBWebDesign.webp',
    links: [
      { label: 'Deployed DEMO', href: 'https://keb-project.vercel.app/' },
      { label: 'Git repo', href: 'https://github.com/Patrick-Sheng/keb-project' },
    ],
    log: [
      {
        code: '01 · BRIEF',
        body: [
          "KEB Project Playground 2025, my first competition at university. Each team was set a mission: build something genuinely useful for the Korean Engineering Body. Ours was the club's first website, with a home page, an events listing with a sign-up form, and an About page for the executive team, built in about a week in React 19 with Vite, React Router and React Bootstrap.",
        ],
      },
      {
        code: '02 · TEAM',
        body: [
          'I was a junior engineering student on a team of senior software students, so the least experienced person in the room. I opened with a team discussion where each of us shared our strengths and weaknesses, and I went first, admitting my front-end gaps, so the others felt safe doing the same. We divided the work on that basis.',
        ],
      },
      {
        code: '03 · BUILD',
        body: [
          "I took on the parts I could realistically catch up on fast, asking the seniors questions and learning as I went. The page I owned was About: the club's executive team as cards built from one reusable component, each with the team's role, the member's photo, and a link to their profile.",
        ],
      },
      {
        code: '04 · OUTCOME',
        body: [
          "We delivered on time, and the site became the club's first website. What it taught me: being upfront about what you don't know is what actually lets a team move fast together.",
        ],
      },
    ],
  },
  {
    title: 'Smart Energy Monitor',
    slug: 'smart-energy-monitor',
    blurb: 'Dual-channel ATmega328P firmware · 2-layer Altium PCB · ±5% FS',
    icon: 'zap',
    tag: 'Embedded C · Team Project',
    year: '2025',
    org: 'University of Auckland (UoA)',
    role: 'Embedded Energy Monitoring System',
    highlights: [
      'Designed a dual channel energy monitoring system, using **signal conditioned ADC sampling** on an **ATmega328P**, to compute RMS voltage, peak current, and average power in real time.',
      'Built and validated a **double layer PCB**, using **Altium Designer** and UART based output, to meet a **±5% full scale** accuracy spec across a 2.5 to 7.5 VA load range.',
    ],
    tech: ['C', 'ATmega328P', 'Atmel AVR', 'Altium Designer', 'LTspice', 'Proteus'],
    image: './energy_monitor.webp',
    video: './smart.mp4',
    // the media strip is far wider than it is tall, so a centred crop of this
    // clip lands on bare green PCB; bias it upwards to hold the red
    // seven-segment readout, which is the part that actually moves
    focus: '50% 20%',
    // Coursework repo: it lives in a private university org, so a link here
    // would 404 for every visitor. The media and the tech list carry the card.
    links: [],
  },
  {
    title: 'Flappy Universe',
    slug: 'flappy-universe',
    blurb: 'VHDL game on a DE0-CV FPGA · custom VGA sync · LFSR pipe gaps',
    icon: 'cpu',
    tag: 'VHDL · Team Project',
    year: '2026',
    org: 'University of Auckland (UoA)',
    role: 'FPGA Game Implementation',
    highlights: [
      'Implemented a Flappy Bird style game in **VHDL**, using a custom VGA sync generator and PLL based clock division on a **DE0-CV FPGA**, to render real time sprite based gameplay.',
      'Built a **hardware LFSR** random number generator, using **shift register feedback logic**, to procedurally place pipe gaps and drive collision detection and scoring.',
    ],
    tech: ['VHDL', 'DE0-CV FPGA', 'Intel Quartus Prime', 'ModelSim'],
    image: './flappy_universe.webp',
    video: './flappy.mp4',
    // Coursework repo, private university org: see Smart Energy Monitor.
    links: [],
  },
  {
    title: 'RoastWorks Analytics',
    slug: 'roastworks-analytics',
    blurb: 'PyQt6 + pandas desktop app · 3 forecasting models',
    icon: 'chart',
    tag: 'Python · Team Project',
    year: '2026',
    org: 'University of Auckland (UoA)',
    role: 'Business Analytics Dashboard',
    highlights: [
      'Built a PyQt6 desktop analytics app with **pandas and Matplotlib**, automating a manual Excel workflow across **3 business units** and **52,000+ records**, cutting report time from a full day to **under 30 seconds**.',
      "Implemented three forecasting models across **36 months of data**, combining **scikit-learn** regression with a custom **NumPy** build of Holt's Exponential Smoothing, validated with MAE and RMSE.",
    ],
    tech: ['Python', 'PyQt6', 'Pandas', 'Matplotlib', 'NumPy', 'scikit-learn'],
    image: './roastworks.webp',
    // Coursework repo, private university org: see Smart Energy Monitor.
    links: [],
  },
  {
    title: 'MealHub',
    slug: 'mealhub',
    blurb: 'Android meal planner · Java + Firebase',
    icon: 'phone',
    tag: 'Java · Team Project',
    year: '2026',
    org: 'University of Auckland (UoA)',
    role: 'Android Meal Planning App',
    highlights: [
      'Built an Android recipe and meal planning app in **Java** with **Firebase Firestore**, enabling users to browse cuisines, search food items, and persist personalised meal plans.',
      'Implemented a **nutrition goal tracking** system using SharedPreferences to set and track daily targets.',
    ],
    tech: ['Java', 'Android Studio', 'XML', 'Figma', 'Firebase Firestore'],
    image: './MealHub.webp',
    // Coursework repo, private university org: see Smart Energy Monitor.
    links: [],
  },
]

// --- experience --------------------------------------------------------------

// Bullets are kept to a similar length on purpose: at the section's width
// each one then sets a single line, so the list reads as an even block
// instead of one two-line entry sitting above two one-line entries.
export const EXPERIENCE = [
  {
    id: 'cares',
    role: 'Research Assistant',
    org: 'University of Auckland',
    detail: 'CARES (Centre for Automation and Robotic Engineering Science)',
    period: 'Jul 2026 - Oct 2026',
    image: './UoA.jpg',
    bullets: [
      "Studied the lab's robot soccer system: camera calibration, vision processing, and decision strategy design.",
      'Investigated TurtleBot2 navigation, LiDAR integration, and control using ROS and Python.',
    ],
  },
  {
    id: 'cilab',
    role: 'Robotics Instructor',
    org: 'Creative Imaginary Lab (ciLab)',
    period: 'Apr 2026 - Oct 2026',
    image: './ciLab.jpg',
    bullets: [
      'Instructed 50+ students in robot hardware assembly and software programming to complete missions.',
      'Supported student development and coached teams in preparation for nationwide robotics competitions.',
    ],
  },
  {
    id: 'twelve',
    role: 'Front of House',
    org: 'Twelve Restaurant',
    period: 'Jul 2024 - Jan 2025',
    image: './twelve.jpg',
    bullets: [
      'Delivered exceptional customer service to keep FoH operations running smoothly during busy periods.',
      'Efficiently resolved complex customer situations while keeping the guest experience positive.',
    ],
  },
]

// --- skills ------------------------------------------------------------------

// Four groups, read straight off the two CVs' skills rows.
export const SKILL_GROUPS = [
  {
    id: 'languages',
    label: 'Programming Languages',
    // The SWE CV's own first row, plus VHDL — that one is a language on the
    // EEE CV and has nowhere else to sit here. React.js lives under Frameworks
    // & Tools instead, which is where the SWE CV files it.
    items: ['Python', 'Java', 'C/C++', 'HTML/CSS', 'JavaScript', 'TypeScript', 'R', 'MATLAB', 'SQL', 'VHDL', 'MIPS Assembly'],
  },
  {
    id: 'cloud-devops',
    label: 'Cloud & DevOps',
    // The CV collapses the AWS services to the word "AWS" because a one-page
    // PDF has no room (Docker, Terraform and GitHub Actions sit here on the CV
    // too). The site does have room, so the services stay named — every one
    // of them appears in a project's tech list further up, which is the whole
    // reason for naming them rather than asking the reader to take "AWS" on
    // faith.
    items: ['AWS', 'Lambda', 'S3', 'DynamoDB', 'Bedrock', 'Textract', 'Comprehend', 'Kinesis', 'SNS', 'Amplify', 'SAM', 'Docker', 'Terraform', 'GitHub Actions'],
  },
  {
    id: 'frameworks-tools',
    label: 'Frameworks & Tools',
    items: ['React.js', 'Node.js', 'Express.js', 'JUnit', 'ROS', 'Git', 'Android Studio', 'Figma', 'REST APIs', 'Spring Boot'],
  },
  {
    id: 'hardware-eda',
    label: 'Hardware & EDA Tools',
    items: ['Altium Designer', 'LTSpice', 'ModelSim', 'Intel Quartus Prime', 'Proteus', 'Atmel AVR', 'AutoCAD'],
  },
]

// --- education ---------------------------------------------------------------

export const DEGREE = {
  id: 'uoa',
  school: 'The University of Auckland',
  city: 'Auckland, NZ',
  period: 'Expected Graduation Nov 2027',
  award: 'Bachelor of Engineering (Honours) · Computer Systems Engineering',
  concentrations: 'Embedded Systems & Software Design',
  // The papers a reader scans for, in one line under the concentration
  // rather than the fourteen-row grid this used to be. Six names will wrap on
  // narrower screens, which is fine for a sentence of coursework; the rest of
  // the hardware papers are left out: the degree's own name has already said
  // "Computer Systems".
  coursework: [
    'Object-Oriented Programming',
    'Software Quality Assurance',
    'Data Structures & Algorithms',
    'Database Systems',
    'Software Architecture',
    'AI & Machine Learning',
  ],
  logo: './UoA.jpg',
}

export const SCHOOL = {
  id: 'pinehurst',
  school: 'Pinehurst School',
  city: 'Auckland, NZ',
  period: 'Aug 2018 - Dec 2023',
  award: 'High School Diploma',
  note: 'Completed CIE IGCSE, AS, and A2 level courses',
  // The diligence awards were the substance of the "multiple diligence awards"
  // line, so they are shown as the awards themselves — one chip per subject,
  // with the syllabus it was sat under.
  diligence: [
    { syllabus: 'NCEA', subject: 'English' },
    { syllabus: 'IGCSE', subject: 'Computer Science' },
    { syllabus: 'AS', subject: 'Physics' },
  ],
  logo: './pinehurst.jpeg',
}

// --- certifications ----------------------------------------------------------

// Grouped by level. Order within a group is oldest-earned first. The colour
// each one's issuer line takes is derived from its tier and issuer (see
// Certifications.tsx), so a new badge lands in the right ink by itself.
export const CERTS = [
  {
    id: 'solutions-architect',
    name: 'AWS Certified Solutions Architect – Associate',
    short: 'Solutions Architect',
    tier: 'Associate',
    issuer: 'AWS',
    date: 'Aug 2026',
    image: './saa.webp',
    description: 'Designs resilient, secure, cost-optimised architectures on AWS.',
    credlyUrl: 'https://www.credly.com/badges/c24fa5a9-1240-4555-8119-2e1decdf0a25/public_url',
  },
  {
    id: 'terraform-associate',
    name: 'HashiCorp Certified: Terraform Associate',
    short: 'Terraform Associate',
    tier: 'Associate',
    issuer: 'HashiCorp',
    date: 'Sep 2026',
    image: './terraform.webp',
    description: 'Provisions and manages infrastructure as code with Terraform.',
    credlyUrl: 'https://www.credly.com/badges/5e4289f2-8f20-4b81-b842-1b34501d85d4/public_url',
  },
  {
    id: 'cloud-practitioner',
    name: 'AWS Certified Cloud Practitioner',
    short: 'Cloud Practitioner',
    tier: 'Foundational',
    issuer: 'AWS',
    date: 'Apr 2026',
    image: './cloud.webp',
    description: 'Covers core AWS concepts, services and best practices.',
    credlyUrl: 'https://www.credly.com/badges/9865f524-64b4-45e4-9f56-8c226ec8308a/public_url',
  },
  {
    id: 'ai-practitioner',
    name: 'AWS Certified AI Practitioner',
    short: 'AI Practitioner',
    tier: 'Foundational',
    issuer: 'AWS',
    date: 'May 2026',
    image: './ai.webp',
    description: 'Covers AI/ML fundamentals and generative AI on AWS.',
    credlyUrl: 'https://www.credly.com/badges/e924df22-3bc9-48c2-847d-d6077a5551d0/public_url',
  },
]

export const CERT_TIERS = ['Associate', 'Foundational']

export type Cert = (typeof CERTS)[number]

// --- leadership --------------------------------------------------------------

// One line a role. These were two CV bullets each, which is right on a PDF
// and wrong in a timeline card: the cards sit in two interleaved columns, so
// every extra line pushes the next card further down the curve. The CV is one
// click away in the navbar for anyone who wants the full pair.
export const ROLES: {
  id: string
  title: string
  detail?: string
  org: string
  period: string
  pinned?: boolean
  image: string
  description: string
}[] = [
  {
    id: 'keb',
    title: 'Academic Team Executive',
    detail: 'Founding Member',
    org: 'Korean Engineering Body (KEB)',
    period: 'Jul 2024 - Oct 2026',
    pinned: true,
    image: './KEB.webp',
    description:
      'Co-founded a 170+ member engineering community and served on its 17-member executive team, delivering tutorial sessions and supporting academic events.',
  },
  {
    id: 'ieee-nzro-2025',
    title: 'Full-time Student Volunteer',
    org: 'IEEE · NZRO 2025',
    period: 'Jul 2025',
    image: './IEEE.webp',
    description:
      'Volunteered 40+ hours on operations and logistics, working with organisers to keep the event running.',
  },
  {
    id: 'nzpmc',
    title: 'Logistics Team Member',
    org: 'The NZPMC Ltd',
    period: 'Jul 2025',
    image: './nzpmc.jpeg',
    description:
      'Logistics team for the New Zealand Physics and Math Competition.',
  },
  {
    id: 'cares-wro-2026',
    title: 'Competition Staff',
    org: 'CARES · WRO 2026',
    period: 'May 2026',
    image: './cares.jpeg',
    description:
      'Volunteered at the World Robot Olympiad 2026 with CARES.',
  },
  {
    id: 'ieee-nzro-2026',
    title: 'Competition Staff',
    org: 'IEEE R&A · NZRO 2026',
    period: 'Jul 2026',
    image: './ieee_r&a.webp',
    description:
      'Selected on prior ciLab experience; led competition operations and resolved technical issues to keep matches running.',
  },
]

// --- about -------------------------------------------------------------------

const issuers = [...new Set(CERTS.map((c) => c.issuer))]

// Every line here is verifiable further down the page: the roles in
// Experience, the placements in Projects, the certificates in Credentials, the
// counts from those lists themselves — which is why the counts are computed
// rather than typed.
//
// Ordered as the grid reads, two to a row: the two placements first, because
// they are the hardest claims to fake; then the certificates and the project
// count, which back up the breadth; then the two posts held, which are the
// context for all of it. The volunteering stays out: it is a section of its
// own further down.
export const HIGHLIGHTS = [
  'Top 8 finalist · 2026 AWS×BNZ AI Hackathon',
  '3rd place · 2025 ECSE Design Competition',
  `${CERTS.length} cloud certifications · ${issuers.slice(0, -1).join(', ')}${issuers.length > 1 ? ' and ' : ''}${issuers.at(-1)}`,
  `${PROJECTS.length} projects across hardware & software`,
  'Research Assistant · CARES robotics lab, UoA',
  'Robotics Instructor & Competition Coach at ciLab',
]
