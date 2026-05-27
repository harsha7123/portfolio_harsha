import React from "react";
import { usePortfolio, SECTIONS } from "../../store/usePortfolio";

export default function Nav() {
  const { activeSection, setActive } = usePortfolio();
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 py-5"
      data-testid="top-nav"
    >
      <div
        className="font-display text-pixel glow-pixel"
        style={{ fontSize: 12 }}
        data-testid="brand"
      >
        HARSHA
      </div>

      <div className="flex items-center gap-3">
        {SECTIONS.map((s) => (
          <button
            key={s}
            onClick={() => setActive(s)}
            className={`nav-link ${activeSection === s ? "active" : ""}`}
            data-testid={`nav-${s}`}
          >
            {s.toUpperCase()}
          </button>
        ))}
      </div>
    </nav>
  );
}
