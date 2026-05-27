# Harsha 3D Portfolio — PRD & Build Log

## Original problem statement
Build a cinematic 3D portfolio for **Chedalla Gopala Krishna Sri Harsha** ("HARSHA").
Reference: *They Call Him OG* teaser (mood) × igloo.inc (structure).
- Single-page, interaction-driven 3D experience.
- HOME / WORK / CONTACT camera framings on one continuous arena.
- Hero figure at center, classic muscle car orbiting, four billboards = live projects.
- No real-actor likeness. Stylized anonymous hero (user's explicit choice).

## User choices (verbatim)
- **3D character:** Generic anonymous hero, no resemblance.
- **Drive mode:** Tier 1 — Guided orbit (scroll/click to drive between billboards).
- **Project roles:** Freelancer (no bounded years). Samsung R&D intern Jan 2025 – Jul 2025; freelancing from Mar 2026.
- **Contact backend:** Store in MongoDB (no Resend).
- **Stack:** Proceed on CRA (React 19 + FastAPI + MongoDB).

## Architecture
- **Frontend:** React 19 + CRA, three.js, @react-three/fiber, @react-three/drei, @react-three/postprocessing, GSAP, framer-motion, Zustand, tailwind, shadcn/ui.
- **Backend:** FastAPI + Motor (async Mongo). Endpoints under `/api`.
- **State:** Zustand store at `src/store/usePortfolio.js` tracks activeSection, carRingIndex, panelOpen, introDone.
- **3D Scene:** Single `<Canvas>` always mounted. CameraRig tweens via GSAP between waypoints. Arena = ring road + hero + car + 4 billboards + embers + ContactShadows + bokeh + bloom/vignette/grain post FX.
- **Visual-edits:** Disabled in `craco.config.js` because the babel plugin injects DOM attributes into lowercase JSX, which breaks react-three-fiber (R3F treats every prop as a three.js property).

## What's implemented (2026-05-27)
- Backend
  - `GET /api/`, `GET /api/health`
  - `GET /api/profile` — full profile with experience, education, skills, socials
  - `GET /api/projects` — 4 projects with title/url/role/year/description/tags
  - `POST /api/contact` — validated (EmailStr, min_length), honeypot, persists to `contact_messages`
  - `GET /api/contact` — **admin-only** (requires `x-admin-token` header), newest-first, limit param
- Frontend
  - Preloader with "IGNITION" pixel-yellow progress (4s safety timeout)
  - 3D scene: stylized humanoid hero (procedural, no face), classic muscle car (procedural with headlight cones), 4 emissive billboards in a ring with **real screenshot textures via thum.io**, wet asphalt ring road, dashed markings, instanced ember particles, city bokeh, ContactShadows
  - Postprocessing: Bloom, ChromaticAberration, Noise (grain), Vignette — **chromatic & noise disabled on mid/low tier**
  - **Quality auto-tiering** — detects mobile UA + `navigator.hardwareConcurrency`; reduces DPR cap (1.0/1.35/1.75), shadows, post-FX, ember count
  - **`prefers-reduced-motion`** — disables hero breathing, auto-rotate, car orbit, ember motion; shortens GSAP camera tweens to 0.2s
  - CameraRig: GSAP eased transitions between HOME / WORK / CONTACT waypoints; chase-cam during free-drive
  - Drag-to-rotate hero with inertia + idle auto-rotate
  - **Tier 2 Free-Drive mode (lightweight, no physics)** — WASD/arrows control velocity + steering around the ring; auto-snaps HUD station counter to nearest billboard; toggle pill in WORK header
  - **Web Audio synth audio** — `lib/audio.js` (no external files): low-frequency drone + filtered noise wind ambient bed; ignition SFX (noise burst + downward sweep); whoosh + click micro-SFX; gesture-gated; persistent mute toggle in nav stored in `localStorage`
  - Scroll-to-section throttled mapping
  - HOME panels (left intro, right chips/socials/enter-work)
  - WORK overlay: station counter, prev/next/view-project, dot indicator, free-drive toggle, WASD legend
  - Project panel: title, role/year, description, tags, lazy iframe live preview, VISIT LIVE, DRIVE ON
  - CONTACT overlay: form (name/email/message + honeypot) hitting POST /api/contact, side panel with email/linkedin/phone, BACK HOME
  - **Mobile responsive** — HOME / CONTACT panels stack vertically below 700px; project panel slides to bottom on tablets <900px; nav densifies on small screens
  - **AA contrast** — text-mid bumped to `#B8B8BA`, text-lo to `#8A8A8E` — passes WCAG AA on void background
  - Sonner toasts
  - Top nav (HOME / WORK / CONTACT + sound toggle), brand mark, footer meta
  - Film grain + scanline overlays for cinematic feel
- Verified via testing_agent_v3 — **iteration 2: backend 100% (13/13 tests pass)** including admin-token auth coverage

## Polish pass deferred to next iteration
- WCAG audit beyond contrast (focus rings, screen-reader-only labels)
- Per-project screenshots refresh schedule (thum.io caches but stale long-term)
- Real Tier 2 physics car (rapier) — current Tier 2 is keyboard-controlled ring traversal, not full physics
- Sound: replace synth ambient with CC0 music bed once Harsha sources files

## Backlog / next phases
- **P5 Polish** — quality auto-tiering (low/high based on GPU), prefers-reduced-motion fallback, mobile breakpoint pass (stack panels), AA contrast audit on overlay text.
- **P6 Sound** — Howler.js ambient bed + ignition SFX on entering WORK; persistent mute toggle in nav.
- **Resend integration** — switch contact form from MongoDB-only to also email Harsha (when API key provided).
- **Per-project screenshots as billboard textures** — currently text-only billboards; capture real screenshots at build time and apply as KTX2 textures.
- **Tier 2 free-drive** — @react-three/rapier WASD physics car (stretch).
- **SEO/OG** — render a still image, add meta tags, sitemap.
- **Admin view** — protected route to list contact submissions (`GET /api/contact` is currently public).

## Files of note
- `/app/frontend/src/App.js` — top-level shell, data fetch, scroll-to-section
- `/app/frontend/src/store/usePortfolio.js` — Zustand store
- `/app/frontend/src/content/portfolio.js` — fallback content
- `/app/frontend/src/components/portfolio/Scene.jsx` — `<Canvas>` + drag rotate
- `/app/frontend/src/components/portfolio/Arena.jsx` — full 3D arena composition
- `/app/frontend/src/components/portfolio/Hero.jsx` — procedural stylized hero
- `/app/frontend/src/components/portfolio/Car.jsx` — procedural muscle car
- `/app/frontend/src/components/portfolio/Billboard.jsx` — billboard with drei Text
- `/app/frontend/src/components/portfolio/CameraRig.jsx` — GSAP camera waypoints
- `/app/frontend/src/components/portfolio/Effects.jsx` — postprocessing stack
- `/app/frontend/src/components/portfolio/Embers.jsx` — instanced ember particles
- `/app/frontend/src/components/ui-overlay/*` — Preloader, Nav, HomePanels, WorkOverlay, ContactOverlay
- `/app/backend/server.py` — FastAPI app with all endpoints
- `/app/frontend/craco.config.js` — visual-edits disabled (R3F incompatibility note documented)
