import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePortfolio } from "../../store/usePortfolio";

export default function Preloader() {
  const { introDone, finishIntro } = usePortfolio();
  const [pct, setPct] = useState(0);

  useEffect(() => {
    if (introDone) return;
    let p = 0;
    const t = setInterval(() => {
      p += 12 + Math.random() * 14;
      if (p >= 100) {
        p = 100;
        clearInterval(t);
        setTimeout(() => finishIntro(), 350);
      }
      setPct(Math.min(100, Math.round(p)));
    }, 80);
    // Safety: always finish within 4s no matter what
    const safety = setTimeout(() => {
      clearInterval(t);
      setPct(100);
      finishIntro();
    }, 4000);
    return () => {
      clearInterval(t);
      clearTimeout(safety);
    };
  }, [finishIntro, introDone]);

  return (
    <AnimatePresence>
      {!introDone && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
          style={{ background: "#050506" }}
          data-testid="preloader"
        >
          <div
            className="font-display text-pixel glow-pixel mb-6"
            style={{ fontSize: 11, letterSpacing: "0.2em" }}
          >
            IGNITION
          </div>
          <div className="progress-track mb-4">
            <div
              className="progress-fill"
              style={{ width: `${pct}%` }}
              data-testid="preloader-fill"
            />
          </div>
          <div className="font-display text-lo" style={{ fontSize: 9 }}>
            {pct}% · LOADING NEO-NOIR
          </div>
          <div className="font-display text-mid mt-12" style={{ fontSize: 9 }}>
            CHEDALLA GOPALA KRISHNA SRI HARSHA
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
