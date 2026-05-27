import React, { useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { usePortfolio } from "../../store/usePortfolio";
import { toast } from "sonner";

const ease = [0.16, 1, 0.3, 1];

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function ContactOverlay({ profile }) {
  const { activeSection, setActive } = usePortfolio();
  const show = activeSection === "contact";

  const [form, setForm] = useState({ name: "", email: "", message: "", company: "" });
  const [sending, setSending] = useState(false);

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error("Fill in name, email and message");
      return;
    }
    setSending(true);
    try {
      await axios.post(`${API}/contact`, form);
      toast.success("Message sent. Harsha will reply soon.");
      setForm({ name: "", email: "", message: "", company: "" });
    } catch (err) {
      toast.error("Send failed. Try again or email directly.");
    } finally {
      setSending(false);
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* LEFT form */}
          <motion.form
            key="form"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 1.0, ease }}
            onSubmit={submit}
            className="fixed z-30 pointer-events-auto"
            style={{
              top: "50%",
              left: "5vw",
              transform: "translateY(-50%)",
              width: "min(380px, 38vw)",
            }}
            data-testid="contact-form"
            autoComplete="off"
          >
            <div className="font-display text-pixel mb-3" style={{ fontSize: 10 }}>
              03 / CONTACT
            </div>
            <h2
              className="font-display text-hi mb-7"
              style={{ fontSize: 22, lineHeight: 1.3 }}
              data-testid="contact-title"
            >
              LET'S BUILD<br />SOMETHING.
            </h2>

            {/* honeypot */}
            <input
              type="text"
              name="company"
              tabIndex={-1}
              autoComplete="off"
              value={form.company}
              onChange={update("company")}
              style={{ position: "absolute", left: "-9999px" }}
              aria-hidden="true"
            />

            <div className="mb-5">
              <label className="font-display text-lo block mb-1" style={{ fontSize: 9 }}>
                NAME
              </label>
              <input
                className="input-line"
                value={form.name}
                onChange={update("name")}
                placeholder="Your name"
                data-testid="form-name"
              />
            </div>

            <div className="mb-5">
              <label className="font-display text-lo block mb-1" style={{ fontSize: 9 }}>
                EMAIL
              </label>
              <input
                className="input-line"
                type="email"
                value={form.email}
                onChange={update("email")}
                placeholder="you@domain.com"
                data-testid="form-email"
              />
            </div>

            <div className="mb-7">
              <label className="font-display text-lo block mb-1" style={{ fontSize: 9 }}>
                MESSAGE
              </label>
              <textarea
                className="input-line"
                rows={4}
                value={form.message}
                onChange={update("message")}
                placeholder="What are we building?"
                data-testid="form-message"
                style={{ resize: "vertical", minHeight: 90 }}
              />
            </div>

            <button
              type="submit"
              disabled={sending}
              className="btn-pixel"
              data-testid="form-submit"
            >
              {sending ? "SENDING…" : "SEND ▸"}
            </button>
          </motion.form>

          {/* RIGHT links */}
          <motion.div
            key="links"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            transition={{ duration: 1.0, ease, delay: 0.15 }}
            className="fixed z-30 pointer-events-auto"
            style={{
              top: "50%",
              right: "5vw",
              transform: "translateY(-50%)",
              maxWidth: 280,
              textAlign: "right",
            }}
            data-testid="contact-links"
          >
            <div className="font-display text-mid mb-4" style={{ fontSize: 10 }}>
              REACH OUT
            </div>

            <a
              href={`mailto:${profile.socials.email}`}
              className="block mb-4 nav-link"
              style={{ fontSize: 11 }}
              data-testid="link-email"
            >
              ✉ {profile.socials.email}
            </a>
            <a
              href={profile.socials.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="block mb-4 nav-link"
              style={{ fontSize: 11 }}
              data-testid="link-linkedin"
            >
              ⌬ LINKEDIN ↗
            </a>
            <a
              href={`tel:${profile.socials.phone.replace(/\s/g, "")}`}
              className="block mb-4 nav-link"
              style={{ fontSize: 11 }}
              data-testid="link-phone"
            >
              ☎ {profile.socials.phone}
            </a>
            <div className="font-display text-lo mt-6" style={{ fontSize: 9 }}>
              {profile.socials.location.toUpperCase()}
            </div>

            <button
              onClick={() => setActive("home")}
              className="btn-ember mt-8"
              data-testid="back-home-btn"
            >
              ◂ BACK HOME
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
