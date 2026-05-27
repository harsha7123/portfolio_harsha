import React, { useEffect } from "react";
import { usePortfolio, SECTIONS } from "../../store/usePortfolio";
import { enableSound, disableSound, sfxClick } from "../../lib/audio";

export default function Nav() {
  const { activeSection, setActive, soundOn, toggleSound } = usePortfolio();

  useEffect(() => {
    if (soundOn) enableSound();
    else disableSound();
  }, [soundOn]);

  const onNav = (s) => {
    sfxClick();
    setActive(s);
  };

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

      <div className="flex items-center gap-2 sm:gap-3">
        {SECTIONS.map((s) => (
          <button
            key={s}
            onClick={() => onNav(s)}
            className={`nav-link ${activeSection === s ? "active" : ""}`}
            data-testid={`nav-${s}`}
          >
            {s.toUpperCase()}
          </button>
        ))}
        <button
          onClick={() => {
            sfxClick();
            toggleSound();
          }}
          aria-label={soundOn ? "Mute sound" : "Enable sound"}
          className="nav-link"
          data-testid="sound-toggle"
          title={soundOn ? "Sound on (click to mute)" : "Sound off (click to enable)"}
        >
          {soundOn ? "♪ ON" : "♪ OFF"}
        </button>
      </div>
    </nav>
  );
}
