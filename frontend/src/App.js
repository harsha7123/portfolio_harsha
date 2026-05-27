import { useEffect, useState } from "react";
import axios from "axios";
import "@/App.css";
import Scene from "./components/portfolio/Scene";
import Nav from "./components/ui-overlay/Nav";
import HomePanels from "./components/ui-overlay/HomePanels";
import WorkOverlay from "./components/ui-overlay/WorkOverlay";
import ContactOverlay from "./components/ui-overlay/ContactOverlay";
import Preloader from "./components/ui-overlay/Preloader";
import { Toaster } from "./components/ui/sonner";
import { PROFILE_FALLBACK, PROJECTS_FALLBACK } from "./content/portfolio";
import { usePortfolio } from "./store/usePortfolio";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

function App() {
  const [profile, setProfile] = useState(PROFILE_FALLBACK);
  const [projects, setProjects] = useState(PROJECTS_FALLBACK);
  const { activeSection } = usePortfolio();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [p, pr] = await Promise.all([
          axios.get(`${API}/profile`),
          axios.get(`${API}/projects`),
        ]);
        if (cancelled) return;
        if (p.data) setProfile({ ...PROFILE_FALLBACK, ...p.data });
        if (pr.data && pr.data.length) {
          // preserve accent from fallback
          const merged = pr.data.map((server) => {
            const local = PROJECTS_FALLBACK.find((x) => x.id === server.id);
            return { ...server, accent: local?.accent || "#FF5A1F" };
          });
          setProjects(merged);
        }
      } catch (e) {
        // fallback content already set
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Scroll-to-section mapping (vertical scroll cycles sections)
  useEffect(() => {
    const onWheel = (e) => {
      const order = ["home", "work", "contact"];
      const cur = order.indexOf(activeSection);
      if (e.deltaY > 30 && cur < order.length - 1) {
        usePortfolio.getState().setActive(order[cur + 1]);
      } else if (e.deltaY < -30 && cur > 0) {
        usePortfolio.getState().setActive(order[cur - 1]);
      }
    };
    // throttle
    let last = 0;
    const handler = (e) => {
      const now = Date.now();
      if (now - last < 900) return;
      last = now;
      onWheel(e);
    };
    window.addEventListener("wheel", handler, { passive: true });
    return () => window.removeEventListener("wheel", handler);
  }, [activeSection]);

  return (
    <div className="App" data-testid="app-root">
      <Preloader />
      <Scene />
      <Nav />
      <HomePanels profile={profile} />
      <WorkOverlay projects={projects} />
      <ContactOverlay profile={profile} />

      {/* footer / status */}
      <div
        className="fixed bottom-4 left-6 z-30 font-display text-lo pointer-events-none"
        style={{ fontSize: 9, letterSpacing: "0.1em" }}
        data-testid="footer-meta"
      >
        © {new Date().getFullYear()} · CHEDALLA GOPALA KRISHNA SRI HARSHA · NEO-NOIR PORTFOLIO
      </div>

      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "rgba(10,10,11,0.92)",
            color: "var(--text-hi)",
            border: "1px solid var(--bg-line)",
            fontFamily: "var(--font-body)",
          },
        }}
      />
    </div>
  );
}

export default App;
