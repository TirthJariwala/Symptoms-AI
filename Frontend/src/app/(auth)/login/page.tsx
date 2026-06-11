// ╔══════════════════════════════════════════════════════╗
// ║  EXACT FILE PATH:  src/app/(auth)/login/page.tsx     ║
// ╚══════════════════════════════════════════════════════╝
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Eye, EyeOff, LogIn, Activity, Shield, Lock, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";

/* Matches global.css exactly */
const G = {
  bg:           "#F5F7FB",
  card:         "#FFFFFF",
  primary:      "#3B6FD4",
  primaryLight: "#EEF3FC",
  primaryDark:  "#2A57B8",
  teal:         "#2A9D8F",
  tealLight:    "#E8F6F4",
  success:      "#2DC653",
  danger:       "#E63946",
  warning:      "#F4A261",
  textPrimary:  "#1A2744",
  textSecondary:"#64748B",
  border:       "#E2E8F0",
  sidebar:      "#1A2744",
};

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ email: "", password: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login({ email: form.email, password: form.password });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        "Login failed. Check your credentials.";
      setError(msg);
    }
  };

  const inputBase: React.CSSProperties = {
    width:"100%", padding:"11px 14px",
    background:G.bg, border:`1px solid ${G.border}`,
    borderRadius:10, color:G.textPrimary, fontSize:14,
    outline:"none", fontFamily:"inherit", transition:"border-color 0.18s, box-shadow 0.18s",
  };

  const onFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = G.primary;
    e.target.style.boxShadow   = `0 0 0 3px ${G.primaryLight}`;
    e.target.style.background  = G.card;
  };
  const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = G.border;
    e.target.style.boxShadow   = "none";
    e.target.style.background  = G.bg;
  };

  return (
    <div style={{ minHeight:"100vh", background:G.bg, display:"flex", fontFamily:"'DM Sans',system-ui,sans-serif" }}>

      {/* ── Left panel ── */}
      <div className="ll-left"
        style={{ width:"44%", background:G.sidebar, flexDirection:"column", justifyContent:"space-between", padding:"44px 48px", position:"relative", overflow:"hidden", display:"none" }}
      >
        {/* Subtle grid */}
        <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", opacity:0.04 }}>
          <defs><pattern id="llg" width="48" height="48" patternUnits="userSpaceOnUse"><path d="M48 0L0 0 0 48" fill="none" stroke="white" strokeWidth="0.7"/></pattern></defs>
          <rect width="100%" height="100%" fill="url(#llg)"/>
        </svg>
        {/* Glow */}
        <div style={{ position:"absolute", top:"20%", left:"10%", width:380, height:380, background:`radial-gradient(circle,rgba(59,111,212,0.15) 0%,transparent 70%)`, pointerEvents:"none" }} />
        <div style={{ position:"absolute", bottom:"15%", right:"5%", width:260, height:260, background:`radial-gradient(circle,rgba(42,157,143,0.1) 0%,transparent 70%)`, pointerEvents:"none" }} />

        {/* Logo + headline */}
        <div style={{ position:"relative", zIndex:1 }}>
          <div style={{ display:"flex", alignItems:"center", gap:11, marginBottom:52 }}>
            <div style={{ width:40, height:40, background:`linear-gradient(135deg,${G.primary},${G.teal})`, borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 0 20px rgba(59,111,212,0.35)" }}>
              <Activity size={20} color="white" />
            </div>
            <div>
              <div style={{ color:"#fff", fontFamily:"'Sora',system-ui", fontWeight:800, fontSize:16, lineHeight:1 }}>Symptoms AI</div>
              <div style={{ color:"rgba(255,255,255,0.38)", fontSize:9, letterSpacing:1.8, textTransform:"uppercase", marginTop:3 }}>Disease Prediction System</div>
            </div>
          </div>

          <h1 style={{ fontFamily:"'Sora',system-ui", fontSize:34, fontWeight:800, color:"#fff", lineHeight:1.18, marginBottom:14 }}>
            Clinical Intelligence<br/>
            <span style={{ background:`linear-gradient(135deg,${G.primary},${G.teal})`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>
              At Your Fingertips
            </span>
          </h1>
          <p style={{ color:"rgba(255,255,255,0.52)", fontSize:14, lineHeight:1.74, maxWidth:340 }}>
            AI-assisted medical image analysis for radiologists and clinicians. Faster insights, better decisions, always assistive.
          </p>

          {/* Trust badges */}
          <div style={{ display:"flex", flexDirection:"column", gap:10, marginTop:32 }}>
            {[
              { icon:Shield,       label:"HIPAA Compliant & Fully Audited" },
              { icon:Lock,         label:"End-to-End Encrypted Storage" },
              { icon:CheckCircle2, label:"94.7% Diagnostic Accuracy" },
            ].map(({ icon:Icon, label }) => (
              <div key={label} style={{ display:"flex", alignItems:"center", gap:10, color:"rgba(255,255,255,0.55)", fontSize:13 }}>
                <div style={{ width:30, height:30, background:"rgba(59,111,212,0.15)", border:"1px solid rgba(59,111,212,0.3)", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <Icon size={14} color={G.primary} />
                </div>
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div style={{ position:"relative", zIndex:1, display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
          {[{v:"94.7%",l:"Accuracy"},{v:"128K+",l:"Cases"},{v:"47",l:"Hospitals"}].map(s => (
            <div key={s.l} style={{ background:"rgba(59,111,212,0.12)", border:"1px solid rgba(59,111,212,0.25)", borderRadius:12, padding:"14px 10px", textAlign:"center" }}>
              <div style={{ fontFamily:"'Sora'", fontSize:20, fontWeight:800, color:G.primary }}>{s.v}</div>
              <div style={{ color:"rgba(255,255,255,0.42)", fontSize:10, marginTop:4, fontWeight:500 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right: form ── */}
      <motion.div initial={{ opacity:0, y:18 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.42 }}
        style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"32px 24px" }}
      >
        <div style={{ width:"100%", maxWidth:420 }}>

          {/* Mobile logo */}
          <div className="ll-mob-logo" style={{ display:"flex", alignItems:"center", gap:9, marginBottom:32 }}>
            <div style={{ width:36, height:36, background:`linear-gradient(135deg,${G.primary},${G.teal})`, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Activity size={17} color="white" />
            </div>
            <div>
              <div style={{ color:G.textPrimary, fontFamily:"'Sora'", fontWeight:800, fontSize:15, lineHeight:1 }}>Symptoms AI</div>
              <div style={{ color:G.textSecondary, fontSize:9, letterSpacing:1.2, textTransform:"uppercase", marginTop:2 }}>Disease Prediction</div>
            </div>
          </div>

          {/* Heading */}
          <h2 style={{ fontFamily:"'Sora',system-ui", fontSize:26, fontWeight:800, color:G.textPrimary, marginBottom:5 }}>Welcome back</h2>
          <p style={{ color:G.textSecondary, fontSize:14, marginBottom:28 }}>Sign in to your clinical dashboard</p>

          <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:16 }}>

            {/* Email */}
            <div>
              <label style={{ display:"block", fontSize:11, fontWeight:600, color:G.textSecondary, marginBottom:6, letterSpacing:0.3, textTransform:"uppercase" }}>Email Address</label>
              <input type="email" required placeholder="doctor@hospital.org"
                value={form.email} onChange={e => setForm(f => ({...f, email:e.target.value}))}
                style={inputBase} onFocus={onFocus} onBlur={onBlur}
              />
            </div>

            {/* Password */}
            <div>
              <label style={{ display:"block", fontSize:11, fontWeight:600, color:G.textSecondary, marginBottom:6, letterSpacing:0.3, textTransform:"uppercase" }}>Password</label>
              <div style={{ position:"relative" }}>
                <input type={showPw ? "text" : "password"} required placeholder="••••••••"
                  value={form.password} onChange={e => setForm(f => ({...f, password:e.target.value}))}
                  style={{ ...inputBase, paddingRight:44 }} onFocus={onFocus} onBlur={onBlur}
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  style={{ position:"absolute", right:13, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", color:G.textSecondary, cursor:"pointer", padding:2 }}
                >{showPw ? <EyeOff size={15}/> : <Eye size={15}/>}</button>
              </div>
            </div>

            {/* Remember + forgot */}
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <label style={{ display:"flex", alignItems:"center", gap:7, color:G.textSecondary, fontSize:12, cursor:"pointer" }}>
                <input type="checkbox" style={{ accentColor:G.primary, width:13, height:13 }} />
                Remember me
              </label>
              <a href="#" style={{ color:G.primary, fontSize:12, fontWeight:600, textDecoration:"none" }}>Forgot password?</a>
            </div>

            {/* Submit */}
            {error && (
              <p style={{ color: G.danger, fontSize: 13, marginTop: -4 }}>{error}</p>
            )}

            <motion.button type="submit" disabled={isLoading} whileTap={{ scale:0.98 }}
              style={{
                marginTop:4, display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                padding:"12px 20px",
                background: isLoading ? "rgba(59,111,212,0.55)" : `linear-gradient(135deg,${G.primary},${G.teal})`,
                border:"none", borderRadius:10, color:"white", fontSize:14, fontWeight:700,
                cursor: isLoading ? "not-allowed" : "pointer",
                boxShadow:"0 4px 16px rgba(59,111,212,0.28)", fontFamily:"inherit",
              }}
            >
              {isLoading
                ? <><div style={{ width:16, height:16, border:"2px solid rgba(255,255,255,0.25)", borderTopColor:"white", borderRadius:"50%", animation:"llSpin 0.75s linear infinite" }}/>Signing in...</>
                : <><LogIn size={15}/>Sign In</>
              }
            </motion.button>
          </form>

          {/* Links */}
          <p style={{ textAlign:"center", color:G.textSecondary, fontSize:13, marginTop:22 }}>
            Don&apos;t have an account?{" "}
            <Link href="/register" style={{ color:G.primary, fontWeight:600, textDecoration:"none" }}>Request access</Link>
          </p>
          <div style={{ textAlign:"center", marginTop:14 }}>
            <Link href="/" style={{ color:G.textSecondary, fontSize:11, textDecoration:"none" }}>← Back to home</Link>
          </div>
          <p style={{ textAlign:"center", color:"rgba(100,116,139,0.5)", fontSize:10, marginTop:22, lineHeight:1.7 }}>
            This system is for authorized clinical personnel only.<br/>All access is logged and monitored.
          </p>
        </div>
      </motion.div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        @keyframes llSpin{to{transform:rotate(360deg)}}
        input::placeholder{color:rgba(100,116,139,0.45);}
        @media(min-width:860px){
          .ll-left{display:flex!important;}
          .ll-mob-logo{display:none!important;}
        }
      `}</style>
    </div>
  );
}