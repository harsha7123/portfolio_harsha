import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePortfolio } from "../../store/usePortfolio";

const ease = [0.16, 1, 0.3, 1];

export default function HomePanels({ profile }) {
  const { activeSection, setActive } = usePortfolio();
  const show = activeSection === "home";

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* LEFT panel */}
          <motion.div
            key="left"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 1.1, ease, delay: 0.15 }}
            className="fixed z-30 pointer-events-none"
            style={{
              top: "50%",
              left: "5vw",
              transform: "translateY(-50%)",
              maxWidth: 360,
            }}
            data-testid="home-left-panel"
          >
            <div className="font-display text-mid mb-3" style={{ fontSize: 10 }}>
              01 / HOME
            </div>
            <h1
              className="font-display text-pixel glow-pixel mb-5"
              style={{ fontSize: 28, lineHeight: 1.2 }}
              data-testid="hero-name"
            >
              HARSHA<span className="text-ember">.</span>
            </h1>
            <p
              className="text-hi mb-6"
              style={{ fontSize: 15, lineHeight: 1.6 }}
              data-testid="hero-tagline"
            >
              {profile.tagline}
            </p>
            <p
              className="text-mid mb-8"
              style={{ fontSize: 13, lineHeight: 1.65 }}
            >
              {profile.intro}
            </p>
            <div className="font-display text-lo" style={{ fontSize: 9 }}>
              ▾ drag · scroll to enter <span className="text-pixel">WORK</span>
            </div>
          </motion.div>

          {/* RIGHT panel */}
          <motion.div
            key="right"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            transition={{ duration: 1.1, ease, delay: 0.3 }}
            className="fixed z-30 pointer-events-auto"
            style={{
              top: "50%",
              right: "5vw",
              transform: "translateY(-50%)",
              maxWidth: 320,
              textAlign: "right",
            }}
            data-testid="home-right-panel"
          >
            <div className="font-display text-mid mb-3" style={{ fontSize: 10 }}>
              FOCUS / 2026
            </div>
            <div className="text-hi mb-6" style={{ fontSize: 14, lineHeight: 1.6 }}>
              Platform · AI · Web<br />
              Linux internals → shipped products
            </div>

            <div className="flex flex-wrap justify-end gap-2 mb-8">
              {profile.chips.map((c) => (
                <span
                  key={c}
                  className="font-display"
                  style={{
                    fontSize: 8,
                    letterSpacing: "0.12em",
                    padding: "6px 9px",
                    border: "1px solid var(--bg-line)",
                    color: "var(--text-hi)",
                    background: "rgba(255,255,255,0.02)",
                  }}
                >
                  {c}
                </span>
              ))}
            </div>

            <div className="flex justify-end gap-3 mb-6">
              <a
                href={profile.socials.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="nav-link"
                data-testid="social-linkedin"
              >
                LINKEDIN ↗
              </a>
              <a
                href={`mailto:${profile.socials.email}`}
                className="nav-link"
                data-testid="social-email"
              >
                EMAIL ↗
              </a>
            </div>

            <button
              onClick={() => setActive("work")}
              className="btn-pixel"
              data-testid="enter-work-btn"
            >
              ENTER WORK ▸
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
