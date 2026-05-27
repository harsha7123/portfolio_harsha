import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePortfolio } from "../../store/usePortfolio";
import { PROJECTS_FALLBACK } from "../../content/portfolio";
import { sfxIgnition, sfxWhoosh, sfxClick } from "../../lib/audio";

const ease = [0.16, 1, 0.3, 1];

export default function WorkOverlay({ projects }) {
  const {
    activeSection,
    carRingIndex,
    setRingIndex,
    panelOpen,
    setPanelOpen,
    freeDrive,
    toggleFreeDrive,
  } = usePortfolio();
  const [iframeLoaded, setIframeLoaded] = useState(false);

  const show = activeSection === "work";
  const list = projects && projects.length ? projects : PROJECTS_FALLBACK;
  const current = list[carRingIndex] || list[0];

  // ignition on entering WORK
  useEffect(() => {
    if (show) sfxIgnition();
  }, [show]);

  const driveTo = (i) => {
    sfxWhoosh();
    setIframeLoaded(false);
    setPanelOpen(false);
    setRingIndex(i);
  };
  const nextStop = () => driveTo((carRingIndex + 1) % list.length);
  const prevStop = () => driveTo((carRingIndex - 1 + list.length) % list.length);

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* HUD top */}
          <motion.div
            key="hud"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.9, ease }}
            className="fixed z-30 pointer-events-none px-4"
            style={{ top: 90, left: "50%", transform: "translateX(-50%)", textAlign: "center" }}
            data-testid="work-hud"
          >
            <div className="font-display text-pixel glow-pixel mb-2" style={{ fontSize: 11 }}>
              STATION 0{carRingIndex + 1} / 04
            </div>
            <div className="font-display text-hi" style={{ fontSize: 14, letterSpacing: "0.1em" }}>
              {current.title.toUpperCase()}
            </div>
            <div className="text-hi opacity-80 mt-2" style={{ fontSize: 12 }}>
              {current.tags.join(" · ")}
            </div>
          </motion.div>

          {/* Drive mode toggle (top-right pill) */}
          <motion.button
            key="freedrive"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease }}
            onClick={() => {
              sfxClick();
              toggleFreeDrive();
            }}
            className="fixed z-30 pointer-events-auto"
            style={{
              top: 90,
              right: 24,
              padding: "8px 12px",
              border: "1px solid var(--bg-line)",
              background: "rgba(10,10,11,0.6)",
              color: freeDrive ? "var(--ember)" : "var(--text-hi)",
              fontFamily: "var(--font-display)",
              fontSize: 9,
              letterSpacing: "0.12em",
              cursor: "pointer",
            }}
            data-testid="free-drive-toggle"
            title="Toggle free-drive (WASD / arrow keys)"
          >
            {freeDrive ? "● FREE DRIVE" : "○ GUIDED"}
          </motion.button>

          {!panelOpen && (
            <motion.div
              key="drive"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.8, ease, delay: 0.1 }}
              className="fixed z-30 pointer-events-auto w-full px-4"
              style={{ bottom: 40, left: 0, textAlign: "center" }}
              data-testid="drive-controls"
            >
              <div className="flex items-center justify-center gap-3 sm:gap-4 flex-wrap">
                <button
                  onClick={prevStop}
                  className="btn-ember"
                  data-testid="drive-prev"
                  style={{ padding: "12px 16px" }}
                >
                  ◂ PREV
                </button>
                <button
                  onClick={() => {
                    sfxClick();
                    setPanelOpen(true);
                  }}
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
                      background: i === carRingIndex ? "var(--pixel)" : "var(--bg-line)",
                      boxShadow: i === carRingIndex ? "0 0 8px rgba(255,255,105,0.7)" : "none",
                      transition: "all 0.5s cubic-bezier(0.16,1,0.3,1)",
                      cursor: "pointer",
                      border: 0,
                    }}
                  />
                ))}
              </div>

              {freeDrive && (
                <div className="font-display text-mid mt-4" style={{ fontSize: 9, letterSpacing: "0.18em" }}>
                  W/S · ACCELERATE  ·  A/D · STEER
                </div>
              )}
            </motion.div>
          )}

          <AnimatePresence>
            {panelOpen && (
              <motion.div
                key="panel"
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 60 }}
                transition={{ duration: 1.0, ease }}
                className="fixed z-40 pointer-events-auto project-panel-wrap"
                data-testid="project-panel"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="font-display text-pixel" style={{ fontSize: 10 }}>
                    PROJECT · 0{carRingIndex + 1}
                  </div>
                  <button
                    onClick={() => {
                      sfxClick();
                      setPanelOpen(false);
                    }}
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
                <div className="text-hi opacity-80 mb-3" style={{ fontSize: 12 }}>
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

                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    aspectRatio: "16 / 10",
                    background: "var(--bg-elev)",
                    border: "1px solid var(--bg-line)",
                    marginBottom: 18,
                    overflow: "hidden",
                    boxShadow: "0 0 0 1px rgba(255,255,105,0.08), 0 12px 40px rgba(0,0,0,0.5)",
                  }}
                >
                  {!iframeLoaded && (
                    <div
                      className="absolute inset-0 flex items-center justify-center font-display text-mid"
                      style={{ fontSize: 10, letterSpacing: "0.12em" }}
                    >
                      ◉ LOADING LIVE PREVIEW…
                    </div>
                  )}
                  {/*
                    Render the iframe at desktop width (1440px) and scale it down
                    into the panel for crisp, full-layout rendering instead of
                    the mobile-layout blur we got before.
                  */}
                  <iframe
                    key={current.url}
                    src={current.url}
                    title={current.title}
                    loading="lazy"
                    sandbox="allow-scripts allow-same-origin allow-popups"
                    onLoad={() => setIframeLoaded(true)}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "1280px",
                      height: "800px",
                      border: 0,
                      background: "#000",
                      transformOrigin: "top left",
                      transform: "scale(var(--iframe-scale, 0.46))",
                    }}
                    data-testid="project-iframe"
                  />
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <a
                    href={current.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-pixel"
                    data-testid="visit-live-btn"
                    onClick={() => sfxClick()}
                  >
                    VISIT LIVE ↗
                  </a>
                  <button
                    onClick={() => {
                      sfxClick();
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
