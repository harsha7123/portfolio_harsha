import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePortfolio } from "../../store/usePortfolio";
import { PROJECTS_FALLBACK } from "../../content/portfolio";

const ease = [0.16, 1, 0.3, 1];

export default function WorkOverlay({ projects }) {
  const {
    activeSection,
    carRingIndex,
    setRingIndex,
    panelOpen,
    setPanelOpen,
  } = usePortfolio();
  const [iframeLoaded, setIframeLoaded] = useState(false);

  const show = activeSection === "work";
  const list = projects && projects.length ? projects : PROJECTS_FALLBACK;
  const current = list[carRingIndex] || list[0];

  const driveTo = (i) => {
    setIframeLoaded(false);
    setPanelOpen(false);
    setRingIndex(i);
  };
  const nextStop = () => driveTo((carRingIndex + 1) % list.length);
  const prevStop = () =>
    driveTo((carRingIndex - 1 + list.length) % list.length);

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* HUD top — station counter */}
          <motion.div
            key="hud"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.9, ease }}
            className="fixed z-30 pointer-events-none"
            style={{ top: 90, left: "50%", transform: "translateX(-50%)", textAlign: "center" }}
            data-testid="work-hud"
          >
            <div className="font-display text-pixel glow-pixel mb-2" style={{ fontSize: 11 }}>
              STATION 0{carRingIndex + 1} / 04
            </div>
            <div className="font-display text-hi" style={{ fontSize: 14, letterSpacing: "0.1em" }}>
              {current.title.toUpperCase()}
            </div>
            <div className="text-mid mt-2" style={{ fontSize: 12 }}>
              {current.tags.join(" · ")}
            </div>
          </motion.div>

          {/* Drive controls bottom */}
          {!panelOpen && (
            <motion.div
              key="drive"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.8, ease, delay: 0.1 }}
              className="fixed z-30 pointer-events-auto"
              style={{ bottom: 40, left: "50%", transform: "translateX(-50%)" }}
              data-testid="drive-controls"
            >
              <div className="flex items-center gap-4">
                <button
                  onClick={prevStop}
                  className="btn-ember"
                  data-testid="drive-prev"
                  style={{ padding: "12px 16px" }}
                >
                  ◂ PREV
                </button>
                <button
                  onClick={() => setPanelOpen(true)}
                  className="btn-pixel"
                  data-testid="view-project-btn"
                >
                  VIEW PROJECT ▸
                </button>
                <button
                  onClick={nextStop}
                  className="btn-ember"
                  data-testid="drive-next"
                  style={{ padding: "12px 16px" }}
                >
                  DRIVE ON ▸
                </button>
              </div>

              {/* dots */}
              <div className="flex items-center justify-center gap-2 mt-5">
                {list.map((p, i) => (
                  <button
                    key={p.id}
                    onClick={() => driveTo(i)}
                    aria-label={`Go to ${p.title}`}
                    data-testid={`station-dot-${i}`}
                    style={{
                      width: i === carRingIndex ? 28 : 10,
                      height: 4,
                      background:
                        i === carRingIndex ? "var(--pixel)" : "var(--bg-line)",
                      boxShadow:
                        i === carRingIndex
                          ? "0 0 8px rgba(255,255,105,0.7)"
                          : "none",
                      transition: "all 0.5s cubic-bezier(0.16,1,0.3,1)",
                      cursor: "pointer",
                      border: 0,
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* Project panel (live iframe) */}
          <AnimatePresence>
            {panelOpen && (
              <motion.div
                key="panel"
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 60 }}
                transition={{ duration: 1.0, ease }}
                className="fixed z-40 pointer-events-auto"
                style={{
                  top: "50%",
                  right: "4vw",
                  transform: "translateY(-50%)",
                  width: "min(540px, 46vw)",
                  background: "rgba(10,10,11,0.82)",
                  backdropFilter: "blur(16px)",
                  WebkitBackdropFilter: "blur(16px)",
                  border: "1px solid var(--bg-line)",
                  padding: "26px 28px",
                  boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
                }}
                data-testid="project-panel"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="font-display text-pixel" style={{ fontSize: 10 }}>
                    PROJECT · 0{carRingIndex + 1}
                  </div>
                  <button
                    onClick={() => setPanelOpen(false)}
                    className="nav-link"
                    data-testid="close-panel-btn"
                  >
                    CLOSE ✕
                  </button>
                </div>
                <h2
                  className="font-display text-hi mb-3"
                  style={{ fontSize: 22, lineHeight: 1.25 }}
                  data-testid="project-title"
                >
                  {current.title.toUpperCase()}
                </h2>
                <div className="text-mid mb-3" style={{ fontSize: 12 }}>
                  {current.role} · {current.year}
                </div>
                <p className="text-hi mb-5" style={{ fontSize: 14, lineHeight: 1.6 }}>
                  {current.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-5">
                  {current.tags.map((t) => (
                    <span
                      key={t}
                      className="font-display"
                      style={{
                        fontSize: 8,
                        letterSpacing: "0.12em",
                        padding: "5px 8px",
                        border: "1px solid var(--bg-line)",
                        color: "var(--text-hi)",
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>

                {/* iframe preview */}
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    aspectRatio: "16 / 10",
                    background: "var(--bg-elev)",
                    border: "1px solid var(--bg-line)",
                    marginBottom: 18,
                    overflow: "hidden",
                  }}
                >
                  {!iframeLoaded && (
                    <div
                      className="absolute inset-0 flex items-center justify-center font-display text-mid"
                      style={{ fontSize: 10 }}
                    >
                      LOADING LIVE PREVIEW…
                    </div>
                  )}
                  <iframe
                    key={current.url}
                    src={current.url}
                    title={current.title}
                    loading="lazy"
                    sandbox="allow-scripts allow-same-origin allow-popups"
                    onLoad={() => setIframeLoaded(true)}
                    style={{
                      position: "absolute",
                      inset: 0,
                      width: "100%",
                      height: "100%",
                      border: 0,
                      background: "#000",
                    }}
                    data-testid="project-iframe"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <a
                    href={current.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-pixel"
                    data-testid="visit-live-btn"
                  >
                    VISIT LIVE ↗
                  </a>
                  <button
                    onClick={() => {
                      setPanelOpen(false);
                      nextStop();
                    }}
                    className="btn-ember"
                    data-testid="drive-on-btn"
                  >
                    DRIVE ON ▸
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
}
