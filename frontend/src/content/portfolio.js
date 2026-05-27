// Fallback content (also served by /api/profile and /api/projects)
export const PROFILE_FALLBACK = {
  name: "HARSHA",
  full_name: "Chedalla Gopala Krishna Sri Harsha",
  tagline: "Platform & AI engineer — from Linux kernel internals to shipped web products.",
  intro:
    "I build at the edges — patching kernels by day, shipping web products by night. Freelance engineer crafting fast, beautiful, intentional software.",
  chips: ["Ex-Samsung R&D", "NIT Durgapur", "Linux Kernel", "PyTorch / NLP", "RAG"],
  experience: [
    {
      role: "Platform Engineer Intern",
      org: "Samsung R&D",
      period: "Jan 2025 – Jul 2025",
      note: "Patched Linux-kernel CVEs · ~20% OS perf gain · KSM optimization · custom Linux builds.",
    },
    {
      role: "Freelance Engineer",
      org: "Independent",
      period: "Mar 2026 – Present",
      note: "Shipping production web products end-to-end for founders and small teams.",
    },
  ],
  education: {
    degree: "B.Tech, Electrical Engineering",
    school: "NIT Durgapur",
    period: "2021 – 2025",
    cgpa: "8.28",
  },
  skills: [
    "Linux", "C++", "Python", "Deep Learning", "NLP", "PyTorch", "RAG",
    "Bash", "Git", "SQL", "Pandas", "HTML/CSS", "DSA", "OOP",
  ],
  socials: {
    email: "chedallaharsha3412@gmail.com",
    phone: "+91 78937 71551",
    linkedin: "https://www.linkedin.com/in/chedalla-sriharsha-9a411225a",
    location: "India",
  },
};

export const PROJECTS_FALLBACK = [
  {
    id: "mla",
    title: "My Little Adventure",
    url: "https://mylittleadventure.in",
    screenshot: "/billboards/mla.jpg",
    role: "Freelance Engineer",
    year: "Freelance",
    description:
      "Budget-friendly group-travel platform across India. Designed and shipped the React SPA, booking flow and the marketing surface.",
    tags: ["React", "Web App", "Travel"],
    accent: "#FF5A1F",
  },
  {
    id: "sukhya",
    title: "Sukhya Med",
    url: "https://sukhya.com",
    screenshot: "/billboards/sukhya.jpg",
    role: "Freelance Engineer",
    year: "Freelance",
    description:
      "Healthcare platform — find doctors, book appointments. Patient-first flows, clean UX, optimized for trust and conversion.",
    tags: ["React", "Healthcare", "Booking"],
    accent: "#FFFF69",
  },
  {
    id: "naut",
    title: "NAutomation Labs",
    url: "https://nautomationlabs.com",
    screenshot: "/billboards/naut.jpg",
    role: "Freelance Engineer",
    year: "Freelance",
    description:
      "AI-native engineering studio — problem to MVP in five days. Built the studio site, brand surface and pitch system.",
    tags: ["React", "AI", "Product"],
    accent: "#C81E0F",
  },
  {
    id: "v7",
    title: "V7 Computers",
    url: "https://v7computers.in",
    screenshot: "/billboards/v7.jpg",
    role: "Freelance Engineer",
    year: "Freelance",
    description:
      "One-stop IT business — laptops, printers, CCTV and accessories. Multi-page catalog with lead capture and local SEO.",
    tags: ["Web", "E-commerce", "Business"],
    accent: "#FFB07A",
  },
];
