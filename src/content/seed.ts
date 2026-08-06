import type { SiteContent } from "./types";

/**
 * Local seed content.
 *
 * This is the site's content until Sanity credentials are present. It exists
 * so the project runs, builds, and deploys with zero external setup — and so
 * there is always a known-good reference for the shape the CMS must return.
 *
 * Once /studio is populated, Sanity wins and this file becomes the fallback.
 */
export const seedContent: SiteContent = {
  settings: {
    name: "Om Rajpal",
    role: "AI Engineer",
    thesis:
      "I build AI systems that reach production, not just a demo. I do my best work where the brief is ambiguous and the deadline is real.",
    location: "Gurugram, India",
    email: "omrajpal.exe@gmail.com",
    socials: [
      { label: "GitHub", url: "https://github.com/om13rajpal" },
      { label: "LinkedIn", url: "https://linkedin.com/in/rajpalom" },
      { label: "Email", url: "mailto:omrajpal.exe@gmail.com" },
    ],
    currently: "Opniscience",
    stats: [
      { value: "7", label: "systems shipped" },
      { value: "2", label: "national wins" },
      { value: "1", label: "patent granted" },
    ],
    workIntro:
      "Production AI systems and backend infrastructure. Three of these cannot be shown.",
    contactHeading:
      "Building agentic systems or MCP tooling? Let's talk.",
    footerNote: "Built by Om Rajpal \u00b7 Next.js, GSAP, Sanity",
  },

  projects: [
    {
      slug: "pedigree",
      title: "Pedigree",
      tagline: "Verifiable code passports for AI-assisted commits.",
      org: "IBM Bob Hackathon",
      role: "Creator",
      period: "2026",
      stack: ["TypeScript", "C2PA", "Rekor", "Node.js", "Git"],
      status: "live",
      doodle: "stamp",
      problem: [
        "AI now writes a meaningful share of the code entering production, and nothing in the commit record says so. A diff authored by a model, a diff pair-programmed with one, and a diff typed by hand are indistinguishable once merged.",
        "That gap matters most exactly where provenance already matters: regulated code, defence work, supply chains, anything that has to survive an audit.",
      ],
      build: [
        "Pedigree issues a verifiable passport for every commit: a signed attestation recording what generated the change, under what prompt, and against which model.",
        "The attestation format is C2PA-inspired, borrowing the content-credentials approach that the imaging industry settled on rather than inventing a new one.",
        "Each passport is written to a Rekor transparency log, so the record is append-only and independently auditable. Nobody has to trust the committer, including the committer.",
      ],
      outcome: [
        "Built and presented in 48 hours. Took first place and a $5,000 prize at the IBM Bob Hackathon.",
      ],
      award: "IBM Bob Hackathon 2026: 1st place, $5,000",
      links: [
        { label: "Repository", url: "https://github.com/om13rajpal" },
      ],
    },

    {
      slug: "drdo-rac",
      title: "DRDO-RAC",
      tagline:
        "AI-powered interview board selection for national officer recruitment.",
      org: "DRDO, Ministry of Defence, Government of India",
      role: "SDE Intern, R&D",
      period: "Jun 2025 to Oct 2025",
      stack: ["Python", "Node.js", "PostgreSQL", "Secure deployment"],
      status: "restricted",
      restrictionNote:
        "Built inside a defence research environment. Implementation detail, interfaces, and source are not publishable.",
      doodle: "eye",
      problem: [
        "DRDO's Recruitment and Assessment Centre convenes interview boards at national scale. Composing those boards (matching subject expertise to candidate, while honouring availability and conflict-of-interest constraints) was a manual scheduling problem that grew faster than the people doing it.",
      ],
      build: [
        "An AI-assisted selection system that proposes viable board compositions against the full constraint set, with secure backend services and internal tooling around it.",
        "The work was as much translation as engineering: sitting with scientists, turning operational requirements into specifications that could actually be built, under the documentation and security practices a defence environment requires.",
      ],
      outcome: [
        "Deployed for DRDO-RAC and used against large-scale officer selection workflows.",
        "The project went on to win Smart India Hackathon 2024, placing in the top 2.4% of more than 400,000 participants nationally.",
      ],
      award: "Smart India Hackathon 2024: National winner",
      links: [],
    },

    {
      slug: "growth",
      title: "Growth",
      tagline: "Idea to scheduled post, with the carousel generated in-house.",
      org: "Stealth AI Startup",
      role: "Chief Technology Officer",
      period: "Feb 2026 to Jul 2026",
      stack: ["Next.js", "TypeScript", "Node.js", "PostgreSQL", "LLM orchestration"],
      status: "restricted",
      restrictionNote: "Client-facing product under NDA. Screens and source withheld.",
      doodle: "megaphone",
      problem: [
        "Teams building an audience on LinkedIn were stitching together four tools: one to find ideas, one to write, one to design carousels, one to schedule. Nothing shared context, so every handoff lost the thread.",
      ],
      build: [
        "A single platform carrying a user from content ideation through generation, in-house carousel creation, scheduling, and performance analytics.",
        "Team workflows on top of it: organisations add members, monitor activity, and track individual and team performance against the same numbers.",
        "As CTO I owned the whole surface: frontend architecture, backend services, databases, data pipelines, model integrations, auth, security, and deployment.",
      ],
      outcome: [
        "Shipped to clients and iterated against live usage over a six-month tenure.",
      ],
      links: [],
    },

    {
      slug: "geo",
      title: "GEO",
      tagline: "How do we appear inside AI-generated answers?",
      org: "Stealth AI Startup",
      role: "Chief Technology Officer",
      period: "Feb 2026 to Jul 2026",
      stack: ["TypeScript", "Python", "RAG", "LLM evaluation", "PostgreSQL"],
      status: "restricted",
      restrictionNote: "Client-facing product under NDA. Screens and source withheld.",
      doodle: "ghost",
      problem: [
        "Search is no longer only a list of links. Brands are increasingly discovered inside a generated answer, and almost none of them could tell you whether they appear in one, for which prompts, or how they place against a competitor.",
        "Traditional SEO tooling had no answer, because the surface it measures is not the surface that matters any more.",
      ],
      build: [
        "A Generative Engine Optimization platform that measures brand visibility across AI-generated responses, tracking prompt-level and competitor-level performance over time.",
        "A brand DNA extraction layer that establishes what a brand actually sounds like, then holds generated output to it.",
        "Long-form article generation driven by the platform's own visibility findings, closing the loop from measurement back into content.",
      ],
      outcome: [
        "Delivered as a client-facing product alongside the growth platform.",
      ],
      links: [],
    },

    {
      slug: "intuality",
      title: "Intuality",
      tagline: "Real-time psychometric analysis during live interviews.",
      org: "IntualityAI",
      role: "AI Engineer",
      period: "Dec 2025 to Feb 2026",
      stack: ["Next.js", "Python", "FastAPI", "PostgreSQL", "Real-time inference"],
      status: "live",
      doodle: "brain",
      problem: [
        "Interview outcomes hinge on behavioural signals that everyone in the room perceives and nobody records. The assessment is real; the evidence is anecdotal.",
      ],
      build: [
        "An end-to-end platform performing real-time psychometric and behavioural analysis during structured sessions, tracking indicators such as confidence as they move across the session.",
        "Interactive dashboards that show how each indicator changed over time, so a reviewer can see the shape of a session rather than a single score.",
        "Post-session reports covering psychometric trends, session summaries, behavioural insights, and areas for improvement, plus self-assessment workflows letting a participant compare their own read against the platform's.",
        "Built across every layer: frontend, backend, database, AI integration, data visualisation, and reporting.",
      ],
      outcome: [
        "Owned from architecture through testing, production deployment, and post-release iteration.",
      ],
      links: [],
    },

    {
      slug: "not-at-mrp",
      title: "NOT@MRP",
      tagline: "Backend for a consumer delivery product, under real load.",
      org: "NOT@MRP",
      role: "Backend Developer",
      period: "Oct 2025 to Dec 2025",
      stack: ["Node.js", "React Native", "PostgreSQL", "REST APIs"],
      status: "live",
      doodle: "box",
      problem: [
        "A consumer delivery product where core endpoints were slow enough under real traffic to be felt in the app.",
      ],
      build: [
        "Redesigned database schemas and rewrote the queries behind the hot paths, cutting response times on core endpoints.",
        "Integrated third-party services and authentication flows while keeping the codebase clean and testable.",
        "Built the React Native features sitting on top of that backend, plus payment infrastructure across multiple providers, including webhook verification and failure handling, which is where payment integrations actually break.",
      ],
      outcome: [
        "Shipped production code across full delivery cycles in a fast-moving startup.",
      ],
      links: [],
    }
  ],

  // Oldest first. The trajectory station lays these out left to right along
  // the scroll direction, so chronological order has to match reading order —
  // reversed, scrolling forward walked backwards through time.
  experience: [
    {
      org: "LM Thapar School of Management",
      role: "Software Development Intern",
      location: "Derabassi, India",
      start: "Jun 2024",
      end: "Aug 2024",
      summary:
        "Internal tools and web interfaces for academic and administrative workflows, owned from requirements to deployment.",
    },
    {
      org: "DRDO, Ministry of Defence",
      role: "SDE Intern, R&D",
      location: "Delhi, India",
      start: "Jun 2025",
      end: "Oct 2025",
      summary:
        "Secure backend services and internal tooling, translating operational requirements from scientists into production software.",
    },
    {
      org: "NOT@MRP",
      role: "Backend Developer",
      location: "Patiala, India",
      start: "Oct 2025",
      end: "Dec 2025",
      summary:
        "Backend APIs, database workflows, third-party integrations, and React Native features for a consumer delivery product.",
    },
    {
      org: "IntualityAI",
      role: "AI Engineer",
      location: "Remote",
      start: "Dec 2025",
      end: "Feb 2026",
      summary:
        "Built and deployed an end-to-end platform for real-time psychometric and behavioural analysis during structured interview sessions.",
    },
    {
      org: "Stealth AI Startup",
      role: "Chief Technology Officer",
      location: "Remote",
      start: "Feb 2026",
      end: "Jul 2026",
      summary:
        "Owned product discovery, architecture, engineering, deployment, and iteration for multiple client-facing AI products.",
    },
    {
      org: "Opniscience",
      role: "AI Engineer",
      location: "Gurugram, India",
      start: "Jul 2026",
      end: "Present",
      current: true,
      summary:
        "Production AI agents, RAG pipelines, and Model Context Protocol systems for an AI-native private-markets platform. Designing LLM workflows that connect structured knowledge, internal tools, and application services.",
    },
  ],

  awards: [
    {
      title: "IBM Bob Hackathon",
      org: "IBM",
      year: "2026",
      detail:
        "First place for Pedigree, verifiable code passports for AI-assisted commits, built and presented in 48 hours.",
      metric: "$5,000",
      metricLabel: "First place",
      projectSlug: "pedigree",
    },
    {
      title: "Smart India Hackathon",
      org: "Government of India",
      year: "2024",
      detail:
        "National winner for the DRDO-RAC Interview Board Selection System, India's largest national hackathon.",
      metric: "2.4%",
      metricLabel: "Top, of 400,000+",
      projectSlug: "drdo-rac",
    },
    {
      title: "Robotic arm for automated injection workflows",
      org: "Patent",
      year: "Granted",
      detail:
        "Patent holder for a robotic arm designed to automate precision injection sequences.",
      metric: "1",
      metricLabel: "Patent granted",
    },
    {
      title: "Microsoft Learn Student Chapter",
      org: "Thapar Institute",
      year: "2024",
      detail:
        "Secretary General. Led a flagship event for 500+ attendees and mentored 200+ developers.",
      metric: "200+",
      metricLabel: "Developers mentored",
    },
  ],
};
