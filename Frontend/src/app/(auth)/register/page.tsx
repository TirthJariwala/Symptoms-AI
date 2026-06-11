// ╔══════════════════════════════════════════════════════════╗
// ║  EXACT FILE PATH:  src/app/(auth)/register/page.tsx      ║
// ╚══════════════════════════════════════════════════════════╝
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Activity, UserPlus, Eye, EyeOff, CheckCircle2, Shield, Lock } from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";

/* Matches global.css and login page exactly */
const G = {
  bg:            "#F5F7FB",
  card:          "#FFFFFF",
  primary:       "#3B6FD4",
  primaryLight:  "#EEF3FC",
  primaryDark:   "#2A57B8",
  teal:          "#2A9D8F",
  tealLight:     "#E8F6F4",
  success:       "#2DC653",
  danger:        "#E63946",
  textPrimary:   "#1A2744",
  textSecondary: "#64748B",
  border:        "#E2E8F0",
  sidebar:       "#1A2744",
};

const ROLES = ["Radiologist", "Clinician", "Specialist", "Resident", "Researcher", "Admin"];

const ROLE_MAP: Record<string, string> = {
  Radiologist: "radiologist",
  Clinician: "clinician",
  Specialist: "clinician",
  Resident: "clinician",
  Researcher: "data_scientist",
  Admin: "admin",
};

export default function RegisterPage() {
  const { register, isLoading } = useAuth();
  const [showPw, setShowPw] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", role: "", hospital: "", license: "", password: "" });
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const inputBase: React.CSSProperties = {
    width: "100%", padding: "11px 14px",
    background: G.bg, border: `1px solid ${G.border}`,
    borderRadius: 10, color: G.textPrimary, fontSize: 14,
    outline: "none", fontFamily: "inherit", transition: "border-color 0.18s, box-shadow 0.18s",
  };

  const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.target.style.borderColor = G.primary;
    e.target.style.boxShadow = `0 0 0 3px ${G.primaryLight}`;
    e.target.style.background = G.card;
  };
  const onBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.target.style.borderColor = G.border;
    e.target.style.boxShadow = "none";
    e.target.style.background = G.bg;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await register({
        email: form.email,
        password: form.password,
        full_name: form.name,
        role: ROLE_MAP[form.role] || "clinician",
      });
      setDone(true);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        "Registration failed.";
      setError(msg);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: G.bg, display: "flex", fontFamily: "'DM Sans',system-ui,sans-serif" }}>

      {/* ── Left panel ── */}
      <div className="reg-left"
        style={{ width: "44%", background: G.sidebar, flexDirection: "column", justifyContent: "space-between", padding: "44px 48px", position: "relative", overflow: "hidden", display: "none" }}
      >
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.04 }}>
          <defs><pattern id="regg" width="48" height="48" patternUnits="userSpaceOnUse"><path d="M48 0L0 0 0 48" fill="none" stroke="white" strokeWidth="0.7" /></pattern></defs>
          <rect width="100%" height="100%" fill="url(#regg)" />
        </svg>
        <div style={{ position: "absolute", top: "20%", left: "10%", width: 380, height: 380, background: `radial-gradient(circle,rgba(59,111,212,0.15) 0%,transparent 70%)`, pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "15%", right: "5%", width: 260, height: 260, background: `radial-gradient(circle,rgba(42,157,143,0.1) 0%,transparent 70%)`, pointerEvents: "none" }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 52 }}>
            <div style={{ width: 40, height: 40, background: `linear-gradient(135deg,${G.primary},${G.teal})`, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 20px rgba(59,111,212,0.35)" }}>
              <Activity size={20} color="white" />
            </div>
            <div>
              <div style={{ color: "#fff", fontFamily: "'Sora',system-ui", fontWeight: 800, fontSize: 16, lineHeight: 1 }}>Symptoms AI</div>
              <div style={{ color: "rgba(255,255,255,0.38)", fontSize: 9, letterSpacing: 1.8, textTransform: "uppercase", marginTop: 3 }}>Disease Prediction System</div>
            </div>
          </div>

          <h1 style={{ fontFamily: "'Sora',system-ui", fontSize: 34, fontWeight: 800, color: "#fff", lineHeight: 1.18, marginBottom: 14 }}>
            Request Clinical<br />
            <span style={{ background: `linear-gradient(135deg,${G.primary},${G.teal})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              Platform Access
            </span>
          </h1>
          <p style={{ color: "rgba(255,255,255,0.52)", fontSize: 14, lineHeight: 1.74, maxWidth: 340 }}>
            Submit your credentials for admin review. Access is granted to verified radiologists, clinicians, and research staff only.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 32 }}>
            {[
              { icon: Shield, label: "HIPAA Compliant & Fully Audited" },
              { icon: Lock, label: "End-to-End Encrypted Storage" },
              { icon: CheckCircle2, label: "Admin-Verified Access Only" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 10, color: "rgba(255,255,255,0.55)", fontSize: 13 }}>
                <div style={{ width: 30, height: 30, background: "rgba(59,111,212,0.15)", border: "1px solid rgba(59,111,212,0.3)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon size={14} color={G.primary} />
                </div>
                {label}
              </div>
            ))}
          </div>
        </div>

        <div style={{ position: "relative", zIndex: 1, display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
          {[{ v: "94.7%", l: "Accuracy" }, { v: "128K+", l: "Cases" }, { v: "47", l: "Hospitals" }].map((s) => (
            <div key={s.l} style={{ background: "rgba(59,111,212,0.12)", border: "1px solid rgba(59,111,212,0.25)", borderRadius: 12, padding: "14px 10px", textAlign: "center" }}>
              <div style={{ fontFamily: "'Sora'", fontSize: 20, fontWeight: 800, color: G.primary }}>{s.v}</div>
              <div style={{ color: "rgba(255,255,255,0.42)", fontSize: 10, marginTop: 4, fontWeight: 500 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right: form ── */}
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.42 }}
        style={{ flex: 1, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "32px 24px 48px", overflowY: "auto" }}
      >
        <div style={{ width: "100%", maxWidth: 480, paddingTop: 8 }}>

          <div className="reg-mob-logo" style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 32 }}>
            <div style={{ width: 36, height: 36, background: `linear-gradient(135deg,${G.primary},${G.teal})`, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Activity size={17} color="white" />
            </div>
            <div>
              <div style={{ color: G.textPrimary, fontFamily: "'Sora'", fontWeight: 800, fontSize: 15, lineHeight: 1 }}>Symptoms AI</div>
              <div style={{ color: G.textSecondary, fontSize: 9, letterSpacing: 1.2, textTransform: "uppercase", marginTop: 2 }}>Disease Prediction</div>
            </div>
          </div>

          {done ? (
            <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: "center", padding: "28px 0" }}>
              <div style={{ width: 62, height: 62, background: G.tealLight, border: `1px solid rgba(42,157,143,0.28)`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
                <CheckCircle2 size={28} color={G.teal} />
              </div>
              <h2 style={{ fontFamily: "'Sora'", fontSize: 24, fontWeight: 800, color: G.textPrimary, marginBottom: 9 }}>Request Submitted!</h2>
              <p style={{ color: G.textSecondary, fontSize: 14, lineHeight: 1.72, marginBottom: 26, maxWidth: 320, margin: "0 auto 26px" }}>
                Your access request has been sent for admin review. You&apos;ll receive an email once approved.
              </p>
              <Link href="/login"
                style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "12px 22px", background: `linear-gradient(135deg,${G.primary},${G.teal})`, borderRadius: 10, color: "white", fontSize: 14, fontWeight: 700, textDecoration: "none", boxShadow: "0 4px 16px rgba(59,111,212,0.28)" }}
              >Go to Sign In →</Link>
            </motion.div>
          ) : (
            <>
              <h2 style={{ fontFamily: "'Sora',system-ui", fontSize: 26, fontWeight: 800, color: G.textPrimary, marginBottom: 5 }}>Request Access</h2>
              <p style={{ color: G.textSecondary, fontSize: 14, marginBottom: 28 }}>Submit your details for admin review. Access is granted to verified clinical staff only.</p>

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: G.textSecondary, marginBottom: 6, letterSpacing: 0.3, textTransform: "uppercase" }}>Full Name</label>
                  <input type="text" required placeholder="Dr. Jane Smith" value={form.name} onChange={set("name")} style={inputBase} onFocus={onFocus} onBlur={onBlur} />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: G.textSecondary, marginBottom: 6, letterSpacing: 0.3, textTransform: "uppercase" }}>Institutional Email</label>
                  <input type="email" required placeholder="doctor@hospital.org" value={form.email} onChange={set("email")} style={inputBase} onFocus={onFocus} onBlur={onBlur} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }} className="reg-grid">
                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: G.textSecondary, marginBottom: 6, letterSpacing: 0.3, textTransform: "uppercase" }}>Role</label>
                    <select required value={form.role} onChange={set("role")} style={{ ...inputBase, appearance: "none", cursor: "pointer" }} onFocus={onFocus} onBlur={onBlur}>
                      <option value="">Select role</option>
                      {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: G.textSecondary, marginBottom: 6, letterSpacing: 0.3, textTransform: "uppercase" }}>Hospital / Institution</label>
                    <input type="text" required placeholder="City General" value={form.hospital} onChange={set("hospital")} style={inputBase} onFocus={onFocus} onBlur={onBlur} />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: G.textSecondary, marginBottom: 6, letterSpacing: 0.3, textTransform: "uppercase" }}>
                    Medical License Number <span style={{ fontWeight: 400, textTransform: "none" }}>(optional)</span>
                  </label>
                  <input type="text" placeholder="MED-123456" value={form.license} onChange={set("license")} style={inputBase} onFocus={onFocus} onBlur={onBlur} />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: G.textSecondary, marginBottom: 6, letterSpacing: 0.3, textTransform: "uppercase" }}>Password</label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showPw ? "text" : "password"} required
                      placeholder="Create a strong password"
                      value={form.password} onChange={set("password")}
                      style={{ ...inputBase, paddingRight: 44 }}
                      onFocus={onFocus} onBlur={onBlur}
                    />
                    <button type="button" onClick={() => setShowPw(!showPw)}
                      style={{ position: "absolute", right: 13, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: G.textSecondary, cursor: "pointer", padding: 2 }}
                    >{showPw ? <EyeOff size={15} /> : <Eye size={15} />}</button>
                  </div>
                </div>

                <label style={{ display: "flex", alignItems: "flex-start", gap: 8, color: G.textSecondary, fontSize: 12, cursor: "pointer", lineHeight: 1.65 }}>
                  <input type="checkbox" required style={{ accentColor: G.primary, width: 13, height: 13, marginTop: 2, flexShrink: 0 }} />
                  I confirm I am authorized clinical personnel and agree to the{" "}
                  <a href="#" style={{ color: G.primary, textDecoration: "none" }}>Terms of Use</a>
                  {" "}and{" "}
                  <a href="#" style={{ color: G.primary, textDecoration: "none" }}>Privacy Policy</a>.
                </label>

                {error && <p style={{ color: G.danger, fontSize: 13, marginTop: -4 }}>{error}</p>}

                <motion.button type="submit" disabled={isLoading} whileTap={{ scale: 0.98 }}
                  style={{
                    marginTop: 4, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    padding: "12px 20px",
                    background: isLoading ? "rgba(59,111,212,0.55)" : `linear-gradient(135deg,${G.primary},${G.teal})`,
                    border: "none", borderRadius: 10, color: "white", fontSize: 14, fontWeight: 700,
                    cursor: isLoading ? "not-allowed" : "pointer",
                    boxShadow: "0 4px 16px rgba(59,111,212,0.28)", fontFamily: "inherit",
                  }}
                >
                  {isLoading
                    ? <><div style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.25)", borderTopColor: "white", borderRadius: "50%", animation: "regSpin 0.75s linear infinite" }} />Submitting...</>
                    : <><UserPlus size={15} />Submit Request</>
                  }
                </motion.button>
              </form>

              <p style={{ textAlign: "center", color: G.textSecondary, fontSize: 13, marginTop: 22 }}>
                Already have access?{" "}
                <Link href="/login" style={{ color: G.primary, fontWeight: 600, textDecoration: "none" }}>Sign in</Link>
              </p>
              <div style={{ textAlign: "center", marginTop: 14 }}>
                <Link href="/" style={{ color: G.textSecondary, fontSize: 11, textDecoration: "none" }}>← Back to home</Link>
              </div>
              <p style={{ textAlign: "center", color: "rgba(100,116,139,0.5)", fontSize: 10, marginTop: 22, lineHeight: 1.7 }}>
                This system is for authorized clinical personnel only.<br />All access is logged and monitored.
              </p>
            </>
          )}
        </div>
      </motion.div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        @keyframes regSpin{to{transform:rotate(360deg)}}
        input::placeholder{color:rgba(100,116,139,0.45);}
        @media(min-width:860px){
          .reg-left{display:flex!important;}
          .reg-mob-logo{display:none!important;}
        }
        @media(max-width:540px){
          .reg-grid{grid-template-columns:1fr!important;}
        }
      `}</style>
    </div>
  );
}
