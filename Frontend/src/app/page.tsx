// ╔══════════════════════════════════════════╗
// ║  EXACT FILE PATH:  src/app/page.tsx      ║
// ╚══════════════════════════════════════════╝
"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import {
  Activity, ArrowRight, Shield, Brain, Zap, Eye,
  CheckCircle2, Star, ChevronDown, Lock, Microscope,
  Cpu, FileText, Upload, LayoutDashboard,
  Home, History, BarChart3, Menu, X, ChevronRight,
  Stethoscope, LogIn, UserPlus,
  PanelLeftClose, PanelLeftOpen,
} from "lucide-react";

/* ─────────────────────────────────────────
   DESIGN TOKENS — matches global.css exactly
───────────────────────────────────────── */
const T = {
  bg:            "#F5F7FB",
  card:          "#FFFFFF",
  sidebar:       "#1A2744",
  sidebarHov:    "#243356",
  sidebarActive: "rgba(59,111,212,0.18)",
  primary:       "#3B6FD4",
  primaryLight:  "#EEF3FC",
  primaryDark:   "#2A57B8",
  teal:          "#2A9D8F",
  tealLight:     "#E8F6F4",
  danger:        "#E63946",
  warning:       "#F4A261",
  success:       "#2DC653",
  textPrimary:   "#1A2744",
  textSecondary: "#64748B",
  border:        "#E2E8F0",
  sidebarW:      240,
  sidebarC:      60,
};

/* ─────────────────────────────────────────
   NAV DATA
───────────────────────────────────────── */
const NAV_ITEMS = [
  { label: "Home",      href: "/",          icon: Home },
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Upload",    href: "/upload",    icon: Upload },
  { label: "History",   href: "/history",   icon: History },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
];
const ANCHORS = [
  { label: "How It Works", href: "#how-it-works" },
  { label: "Features",     href: "#features" },
  { label: "Conditions",   href: "#conditions" },
  { label: "Performance",  href: "#performance" },
];

/* ─────────────────────────────────────────
   THREE SCENE — lazy loaded, keyed for remount
───────────────────────────────────────── */
const ThreeScene = dynamic(() => import("@/components/landing/ThreeScene"), {
  ssr: false,
  loading: () => (
    <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ width:34, height:34, border:`3px solid ${T.primaryLight}`, borderTopColor:T.primary, borderRadius:"50%", animation:"ldSpin 0.8s linear infinite", margin:"0 auto 10px" }} />
        <p style={{ color:T.textSecondary, fontSize:11, letterSpacing:1 }}>Loading...</p>
      </div>
    </div>
  ),
});

/* ─────────────────────────────────────────
   BACKGROUND CANVAS
   Fix: uses a `canvasId` key so useEffect
   re-runs fully whenever the page remounts
   after back-navigation.
───────────────────────────────────────── */
function BackgroundCanvas({ id }: { id: number }) {
  const ref    = useRef<HTMLCanvasElement>(null);
  const animId = useRef(0);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let W = (canvas.width  = window.innerWidth);
    let H = (canvas.height = window.innerHeight);

    const onResize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };
    window.addEventListener("resize", onResize);

    /* heartbeat normalised points */
    const HB = [
      0,0, 0.04,0, 0.09,0, 0.13,-0.05, 0.17,0.24,
      0.22,-0.38, 0.27,0.62, 0.32,-0.14, 0.37,0, 0.42,0,
      0.50,0, 0.55,0, 0.59,-0.04, 0.63,0.17,
      0.68,-0.28, 0.73,0.46, 0.78,-0.10, 0.83,0, 0.88,0, 1.0,0,
    ];

    /* DNA chains */
    const PALETTES: [string,string][] = [
      ["#3B6FD4","#2A9D8F"],["#5B8AD4","#3B9D8F"],
      ["#2A9D8F","#3B6FD4"],["#4A7FD4","#2A8F80"],
    ];
    const chains = Array.from({ length: 10 }, (_, i) => {
      const [c1, c2] = PALETTES[i % PALETTES.length];
      return {
        x: (i + 0.5) * (W / 10) + (Math.random() - 0.5) * (W / 20),
        baseY: Math.random() * H,
        spacing: 22 + Math.random() * 10,
        radius: 10 + Math.random() * 8,
        phase: Math.random() * Math.PI * 2,
        speed: 0.18 + Math.random() * 0.22,
        alpha: 0.055 + Math.random() * 0.07,
        c1, c2,
      };
    });

    /* ambient dots */
    const dots = Array.from({ length: 22 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.12, vy: (Math.random() - 0.5) * 0.12,
      r: 1.5 + Math.random() * 1.5, a: 0.06 + Math.random() * 0.09,
    }));

    let t = 0;

    const drawChain = (ch: typeof chains[0]) => {
      const total = Math.ceil(H / ch.spacing) + 4;
      const startY = (ch.baseY % H) - ch.spacing * 2;
      for (let i = 0; i < total; i++) {
        const py = (((startY + i * ch.spacing) % H) + H) % H;
        const ang = i * 0.55 + ch.phase + t * 0.3;
        const bx1 = ch.x + Math.cos(ang) * ch.radius;
        const bx2 = ch.x - Math.cos(ang) * ch.radius;

        // rung
        ctx.globalAlpha = ch.alpha * 0.7;
        const rg = ctx.createLinearGradient(bx1, py, bx2, py);
        rg.addColorStop(0, ch.c1); rg.addColorStop(0.5, "#fff"); rg.addColorStop(1, ch.c2);
        ctx.strokeStyle = rg; ctx.lineWidth = 0.7;
        ctx.beginPath(); ctx.moveTo(bx1, py); ctx.lineTo(bx2, py); ctx.stroke();

        // beads
        ctx.globalAlpha = ch.alpha * 1.2;
        [[bx1, ch.c1],[bx2, ch.c2]].forEach(([x, c]) => {
          const g = ctx.createRadialGradient(Number(x), py, 0, Number(x), py, 4);
          g.addColorStop(0, String(c) + "aa"); g.addColorStop(1, "transparent");
          ctx.fillStyle = g;
          ctx.beginPath(); ctx.arc(Number(x), py, 4, 0, Math.PI * 2); ctx.fill();
        });

        // backbone
        if (i < total - 1) {
          const npy = (((startY + (i+1) * ch.spacing) % H) + H) % H;
          if (Math.abs(npy - py) < ch.spacing * 1.5) {
            const na = (i+1) * 0.55 + ch.phase + t * 0.3;
            const nb1 = ch.x + Math.cos(na) * ch.radius;
            const nb2 = ch.x - Math.cos(na) * ch.radius;
            ctx.globalAlpha = ch.alpha * 0.45; ctx.lineWidth = 0.5;
            [[bx1,nb1,ch.c1],[bx2,nb2,ch.c2]].forEach(([ax,bx,c]) => {
              ctx.strokeStyle = String(c) + "55";
              ctx.beginPath(); ctx.moveTo(Number(ax), py); ctx.lineTo(Number(bx), npy); ctx.stroke();
            });
          }
        }
      }
      ctx.globalAlpha = 1;
    };

    const drawHeartbeat = () => {
      const hbW = W * 0.62, hbX = W * 0.19, hbY = H * 0.50, hbA = H * 0.07;
      const off = (t * 0.18) % 1;
      ctx.save();
      ctx.beginPath(); ctx.rect(hbX - 8, hbY - hbA - 16, hbW + 16, hbA * 2 + 32); ctx.clip();
      ctx.shadowBlur = 12; ctx.shadowColor = "rgba(59,111,212,0.28)";
      const lg = ctx.createLinearGradient(hbX, 0, hbX + hbW, 0);
      lg.addColorStop(0,    "rgba(59,111,212,0)");
      lg.addColorStop(0.15, "rgba(59,111,212,0.65)");
      lg.addColorStop(0.5,  "rgba(42,157,143,0.75)");
      lg.addColorStop(0.85, "rgba(59,111,212,0.65)");
      lg.addColorStop(1,    "rgba(59,111,212,0)");
      ctx.strokeStyle = lg; ctx.lineWidth = 2; ctx.lineCap = "round"; ctx.lineJoin = "round";
      ctx.beginPath();
      let first = true;
      for (let i = 0; i < HB.length; i += 2) {
        const px = hbX + ((HB[i] + off) % 1) * hbW;
        const py = hbY - HB[i+1] * hbA;
        if (first) { ctx.moveTo(px, py); first = false; } else ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.shadowBlur = 0; ctx.restore();
    };

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = T.bg; ctx.fillRect(0, 0, W, H);

      // grid
      ctx.strokeStyle = "rgba(59,111,212,0.03)"; ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 72) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
      for (let y = 0; y < H; y += 72) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

      // soft glows
      ([
        [W*0.1, H*0.2, 280, "rgba(59,111,212,0.05)"],
        [W*0.9, H*0.7, 240, "rgba(42,157,143,0.04)"],
        [W*0.5, H*0.45,300, "rgba(59,111,212,0.03)"],
      ] as [number,number,number,string][]).forEach(([x,y,r,c]) => {
        const g = ctx.createRadialGradient(x,y,0,x,y,r);
        g.addColorStop(0,c); g.addColorStop(1,"transparent");
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill();
      });

      t += 0.007;
      chains.forEach(ch => {
        ch.baseY -= ch.speed;
        if (ch.baseY < -ch.spacing * 2) ch.baseY = H + ch.spacing * 2;
        drawChain(ch);
      });
      drawHeartbeat();

      // dots
      dots.forEach(d => {
        d.x += d.vx; d.y += d.vy;
        if (d.x < 0) d.x = W; if (d.x > W) d.x = 0;
        if (d.y < 0) d.y = H; if (d.y > H) d.y = 0;
        ctx.globalAlpha = d.a; ctx.fillStyle = T.primary;
        ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI*2); ctx.fill();
        ctx.globalAlpha = 1;
      });
      dots.forEach((a, i) => dots.slice(i+1).forEach(b => {
        const dist = Math.hypot(a.x-b.x, a.y-b.y);
        if (dist < 85) {
          ctx.globalAlpha = 0.05 * (1 - dist/85);
          ctx.strokeStyle = T.primary; ctx.lineWidth = 0.5;
          ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }));

      animId.current = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animId.current);
      window.removeEventListener("resize", onResize);
    };
  // id changing forces full re-run of this effect
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  return <canvas ref={ref} style={{ position:"fixed", inset:0, zIndex:0, pointerEvents:"none" }} />;
}

/* ─────────────────────────────────────────
   SIDEBAR
───────────────────────────────────────── */
function Sidebar({ open, collapsed, onClose, onToggleCollapse }:
  { open:boolean; collapsed:boolean; onClose:()=>void; onToggleCollapse:()=>void }) {
  const pathname = usePathname();
  const w = collapsed ? T.sidebarC : T.sidebarW;

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            onClick={onClose}
            style={{ position:"fixed", inset:0, background:"rgba(26,39,68,0.45)", zIndex:199, backdropFilter:"blur(2px)" }}
          />
        )}
      </AnimatePresence>

      <div
        className="sidebar-panel"
        style={{
          position:"fixed", top:0, left:0, bottom:0,
          width:w,
          background:T.sidebar, zIndex:200,
          display:"flex", flexDirection:"column",
          boxShadow:"4px 0 24px rgba(26,39,68,0.18)",
          transition:"width 0.26s cubic-bezier(0.4,0,0.2,1), transform 0.28s cubic-bezier(0.4,0,0.2,1)",
          overflow:"hidden",
          transform: open ? "translateX(0)" : `translateX(-${T.sidebarW}px)`,
        }}
      >
        {/* Header */}
        <div style={{ padding: collapsed ? "18px 0" : "20px 14px 16px", borderBottom:"1px solid rgba(255,255,255,0.07)", flexShrink:0, transition:"padding 0.26s" }}>
          {collapsed ? (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:10 }}>
              <div style={{ width:34, height:34, background:`linear-gradient(135deg,${T.primary},${T.teal})`, borderRadius:9, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <Stethoscope size={16} color="white" />
              </div>
              <button onClick={onToggleCollapse} title="Expand"
                style={{ background:"rgba(255,255,255,0.07)", border:"none", borderRadius:7, color:"rgba(255,255,255,0.5)", cursor:"pointer", padding:6, display:"flex" }}
                onMouseEnter={e=>{ e.currentTarget.style.background="rgba(255,255,255,0.14)"; e.currentTarget.style.color="#fff"; }}
                onMouseLeave={e=>{ e.currentTarget.style.background="rgba(255,255,255,0.07)"; e.currentTarget.style.color="rgba(255,255,255,0.5)"; }}
              ><PanelLeftOpen size={14} /></button>
            </div>
          ) : (
            <>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <div style={{ display:"flex", alignItems:"center", gap:9, minWidth:0 }}>
                  <div style={{ width:34, height:34, background:`linear-gradient(135deg,${T.primary},${T.teal})`, borderRadius:9, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <Stethoscope size={16} color="white" />
                  </div>
                  <div style={{ minWidth:0 }}>
                    <div style={{ color:"#fff", fontFamily:"'Sora',system-ui", fontWeight:700, fontSize:13, lineHeight:1, whiteSpace:"nowrap" }}>Symptoms AI</div>
                    <div style={{ color:"rgba(255,255,255,0.36)", fontSize:9, letterSpacing:1.4, textTransform:"uppercase", marginTop:3, whiteSpace:"nowrap" }}>Disease Prediction</div>
                  </div>
                </div>
                <div style={{ display:"flex", gap:3 }}>
                  <button onClick={onToggleCollapse} title="Collapse"
                    style={{ background:"rgba(255,255,255,0.07)", border:"none", borderRadius:7, color:"rgba(255,255,255,0.45)", cursor:"pointer", padding:5, display:"flex" }}
                    onMouseEnter={e=>{ e.currentTarget.style.background="rgba(255,255,255,0.14)"; e.currentTarget.style.color="#fff"; }}
                    onMouseLeave={e=>{ e.currentTarget.style.background="rgba(255,255,255,0.07)"; e.currentTarget.style.color="rgba(255,255,255,0.45)"; }}
                  ><PanelLeftClose size={13} /></button>
                  <button onClick={onClose} className="sidebar-close-btn"
                    style={{ background:"rgba(255,255,255,0.07)", border:"none", borderRadius:7, color:"rgba(255,255,255,0.45)", cursor:"pointer", padding:5, display:"flex" }}
                  ><X size={13} /></button>
                </div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:11, padding:"4px 9px", background:"rgba(45,198,83,0.1)", border:"1px solid rgba(45,198,83,0.2)", borderRadius:6 }}>
                <span style={{ width:5, height:5, background:T.success, borderRadius:"50%", animation:"ldPulse 2s infinite", flexShrink:0 }} />
                <span style={{ color:T.success, fontSize:9, fontWeight:600, letterSpacing:0.3, whiteSpace:"nowrap" }}>System Online · v1.0</span>
              </div>
            </>
          )}
        </div>

        {/* Nav */}
        <div style={{ padding: collapsed ? "12px 0" : "14px 9px 8px", flex:1, overflowY:"auto", overflowX:"hidden" }}>
          {!collapsed && <div style={{ color:"rgba(255,255,255,0.26)", fontSize:9, fontWeight:700, letterSpacing:1.8, textTransform:"uppercase", paddingLeft:8, marginBottom:5 }}>App</div>}
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
            const active = pathname === href;
            return (
              <a key={label} href={href} title={collapsed ? label : undefined}
                style={{
                  display:"flex", alignItems:"center",
                  gap: collapsed ? 0 : 9,
                  justifyContent: collapsed ? "center" : "flex-start",
                  padding: collapsed ? "10px 0" : "8px 10px",
                  borderRadius:8, marginBottom:2, textDecoration:"none",
                  background: active ? T.sidebarActive : "transparent",
                  color: active ? "#fff" : "rgba(255,255,255,0.52)",
                  fontSize:13, fontWeight: active ? 600 : 500,
                  transition:"all 0.15s", whiteSpace:"nowrap", overflow:"hidden",
                }}
                onMouseEnter={e=>{ if(!active){ e.currentTarget.style.background=T.sidebarHov; e.currentTarget.style.color="#fff"; } }}
                onMouseLeave={e=>{ if(!active){ e.currentTarget.style.background="transparent"; e.currentTarget.style.color="rgba(255,255,255,0.52)"; } }}
              >
                <Icon size={15} style={{ flexShrink:0 }} />
                {!collapsed && <><span style={{ flex:1 }}>{label}</span>{active && <ChevronRight size={11} style={{ opacity:0.6 }} />}</>}
              </a>
            );
          })}
        </div>

        {/* Auth bottom */}
        {!collapsed ? (
          <div style={{ padding:"11px 11px 16px", borderTop:"1px solid rgba(255,255,255,0.07)", display:"flex", flexDirection:"column", gap:6, flexShrink:0 }}>
            <a href="/login" style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:6, padding:"8px 12px", background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, color:"rgba(255,255,255,0.78)", fontSize:12, fontWeight:600, textDecoration:"none", transition:"all 0.15s" }}
              onMouseEnter={e=>{ e.currentTarget.style.background="rgba(255,255,255,0.12)"; }}
              onMouseLeave={e=>{ e.currentTarget.style.background="rgba(255,255,255,0.07)"; }}
            ><LogIn size={12} />Sign In</a>
            <a href="/register" style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:6, padding:"8px 12px", background:`linear-gradient(135deg,${T.primary},${T.teal})`, borderRadius:8, color:"white", fontSize:12, fontWeight:700, textDecoration:"none", boxShadow:"0 3px 10px rgba(59,111,212,0.28)", transition:"opacity 0.15s" }}
              onMouseEnter={e=>{ e.currentTarget.style.opacity="0.88"; }}
              onMouseLeave={e=>{ e.currentTarget.style.opacity="1"; }}
            ><UserPlus size={12} />Register</a>
          </div>
        ) : (
          <div style={{ padding:"9px 0 14px", borderTop:"1px solid rgba(255,255,255,0.07)", display:"flex", flexDirection:"column", alignItems:"center", gap:7, flexShrink:0 }}>
            <a href="/login" title="Sign In" style={{ width:34, height:34, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, color:"rgba(255,255,255,0.7)", textDecoration:"none" }}
              onMouseEnter={e=>{ e.currentTarget.style.background="rgba(255,255,255,0.14)"; }}
              onMouseLeave={e=>{ e.currentTarget.style.background="rgba(255,255,255,0.07)"; }}
            ><LogIn size={13} /></a>
            <a href="/register" title="Register" style={{ width:34, height:34, display:"flex", alignItems:"center", justifyContent:"center", background:`linear-gradient(135deg,${T.primary},${T.teal})`, borderRadius:8, color:"white", textDecoration:"none" }}
              onMouseEnter={e=>{ e.currentTarget.style.opacity="0.82"; }}
              onMouseLeave={e=>{ e.currentTarget.style.opacity="1"; }}
            ><UserPlus size={13} /></a>
          </div>
        )}
      </div>
    </>
  );
}

/* ─────────────────────────────────────────
   TOP BAR
───────────────────────────────────────── */
function TopBar({ onMenuClick }: { onMenuClick: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <motion.header initial={{ y:-16, opacity:0 }} animate={{ y:0, opacity:1 }} transition={{ duration:0.4 }}
      style={{ position:"fixed", top:0, left:0, right:0, zIndex:100, height:58, background: scrolled ? "rgba(245,247,251,0.97)" : "rgba(245,247,251,0.88)", backdropFilter:"blur(16px)", borderBottom:`1px solid ${scrolled ? T.border : "transparent"}`, display:"flex", alignItems:"center", padding:"0 20px", gap:12, transition:"all 0.25s" }}
    >
      <button onClick={onMenuClick}
        style={{ width:34, height:34, background:T.card, border:`1px solid ${T.border}`, borderRadius:7, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", flexShrink:0, color:T.textPrimary, transition:"all 0.15s" }}
        onMouseEnter={e=>{ e.currentTarget.style.background=T.primaryLight; e.currentTarget.style.borderColor=T.primary; e.currentTarget.style.color=T.primary; }}
        onMouseLeave={e=>{ e.currentTarget.style.background=T.card; e.currentTarget.style.borderColor=T.border; e.currentTarget.style.color=T.textPrimary; }}
      ><Menu size={16} /></button>

      <a href="/" style={{ display:"flex", alignItems:"center", gap:8, textDecoration:"none" }}>
        <div style={{ width:30, height:30, background:`linear-gradient(135deg,${T.primary},${T.teal})`, borderRadius:7, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <Activity size={15} color="white" />
        </div>
        <div>
          <div style={{ color:T.textPrimary, fontFamily:"'Sora',system-ui", fontWeight:700, fontSize:13, lineHeight:1 }}>Symptoms AI</div>
          <div style={{ color:T.textSecondary, fontSize:8, letterSpacing:1.2, textTransform:"uppercase", marginTop:1 }} className="tb-sub">Disease Prediction System</div>
        </div>
      </a>

      <div style={{ flex:1 }} />

      <nav className="tb-anchors" style={{ display:"flex", alignItems:"center", gap:1 }}>
        {ANCHORS.map(({ label, href }) => (
          <a key={label} href={href}
            style={{ padding:"4px 11px", color:T.textSecondary, fontSize:11, fontWeight:500, textDecoration:"none", borderRadius:6, transition:"all 0.15s" }}
            onMouseEnter={e=>{ e.currentTarget.style.color=T.primary; e.currentTarget.style.background=T.primaryLight; }}
            onMouseLeave={e=>{ e.currentTarget.style.color=T.textSecondary; e.currentTarget.style.background="transparent"; }}
          >{label}</a>
        ))}
      </nav>

      <div style={{ width:1, height:16, background:T.border }} className="tb-div" />

      <div style={{ display:"flex", gap:7 }} className="tb-auth">
        <a href="/login" style={{ padding:"6px 13px", background:T.card, border:`1px solid ${T.border}`, borderRadius:7, color:T.textPrimary, fontSize:11, fontWeight:600, textDecoration:"none", transition:"all 0.15s" }}
          onMouseEnter={e=>{ e.currentTarget.style.borderColor=T.primary; e.currentTarget.style.color=T.primary; }}
          onMouseLeave={e=>{ e.currentTarget.style.borderColor=T.border; e.currentTarget.style.color=T.textPrimary; }}
        >Sign In</a>
        <a href="/register" style={{ padding:"6px 13px", background:T.primary, borderRadius:7, color:"#fff", fontSize:11, fontWeight:700, textDecoration:"none", boxShadow:"0 2px 8px rgba(59,111,212,0.26)", transition:"all 0.15s" }}
          onMouseEnter={e=>{ e.currentTarget.style.background=T.primaryDark; }}
          onMouseLeave={e=>{ e.currentTarget.style.background=T.primary; }}
        >Register</a>
      </div>
    </motion.header>
  );
}

/* ─────────────────────────────────────────
   SCAN LINE
───────────────────────────────────────── */
function ScanLine() {
  return (
    <div style={{ position:"absolute", inset:0, overflow:"hidden", pointerEvents:"none", borderRadius:"inherit" }}>
      <motion.div animate={{ y:["0%","100%"] }} transition={{ duration:4, repeat:Infinity, ease:"linear" }}
        style={{ position:"absolute", left:0, right:0, height:1.5, background:`linear-gradient(90deg,transparent,rgba(59,111,212,0.3),rgba(59,111,212,0.55),rgba(59,111,212,0.3),transparent)` }}
      />
    </div>
  );
}

/* ─────────────────────────────────────────
   TILT CARD
───────────────────────────────────────── */
function TiltCard({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x:0, y:0 });
  return (
    <div ref={ref}
      onMouseMove={e => {
        if (!ref.current) return;
        const r = ref.current.getBoundingClientRect();
        setTilt({ x:((e.clientY-r.top-r.height/2)/(r.height/2))*4, y:-((e.clientX-r.left-r.width/2)/(r.width/2))*4 });
      }}
      onMouseLeave={() => setTilt({ x:0, y:0 })}
      style={{ transform:`perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`, transition: tilt.x===0 ? "transform 0.5s ease" : "transform 0.07s ease", transformStyle:"preserve-3d", ...style }}
    >{children}</div>
  );
}

/* ─────────────────────────────────────────
   HERO
───────────────────────────────────────── */
function Hero({ sceneKey, pageReady }: { sceneKey: number; pageReady: boolean }) {
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0,340], [1,0]);
  const y       = useTransform(scrollY, [0,340], [0,-44]);

  if (!pageReady) return null;

  return (
    <motion.section key={sceneKey} className="hero-pad" style={{ opacity, y, minHeight:"100vh", display:"flex", alignItems:"center", position:"relative", zIndex:10 }}>
      <div style={{ maxWidth:1200, margin:"0 auto", width:"100%", display:"grid", gridTemplateColumns:"1fr 1fr", gap:52, alignItems:"center" }} className="hero-grid">

        {/* Left */}
        <motion.div initial={{ opacity:0, x:-28 }} animate={{ opacity:1, x:0 }} transition={{ duration:0.7 }}>
          <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.18 }}
            style={{ display:"inline-flex", alignItems:"center", gap:7, background:T.primaryLight, border:`1px solid rgba(59,111,212,0.22)`, borderRadius:999, padding:"5px 14px", marginBottom:22 }}
          >
            <span style={{ width:6, height:6, background:T.success, borderRadius:"50%", boxShadow:`0 0 7px ${T.success}`, animation:"ldPulse 2s infinite" }} />
            <span style={{ color:T.primary, fontSize:11, fontWeight:600, letterSpacing:0.3 }}>CNN + Reinforcement Learning · Live</span>
          </motion.div>

          <motion.h1 initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.25, duration:0.6 }}
            style={{ fontFamily:"'Sora',system-ui", fontSize:"clamp(30px,4.2vw,52px)", fontWeight:800, lineHeight:1.12, color:T.textPrimary, marginBottom:14 }}
          >
            AI-Powered<br />
            <span style={{ background:`linear-gradient(135deg,${T.primary} 0%,${T.teal} 100%)`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>
              Disease Prediction
            </span><br />System
          </motion.h1>

          <motion.p initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.34 }}
            style={{ color:T.textSecondary, fontSize:15, lineHeight:1.76, marginBottom:30, maxWidth:430 }}
          >
            Upload medical images and get intelligent, explainable diagnosis. Our hybrid CNN + RL model analyzes X-Ray, MRI, CT scans with Grad-CAM heatmaps for full clinical transparency.
          </motion.p>

          <motion.div initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.42 }} style={{ display:"flex", gap:9, flexWrap:"wrap", marginBottom:26 }} className="hero-btns">
            <a href="/upload" style={{ display:"inline-flex", alignItems:"center", gap:7, padding:"12px 22px", background:T.primary, borderRadius:10, color:"white", fontSize:14, fontWeight:700, textDecoration:"none", boxShadow:"0 4px 16px rgba(59,111,212,0.3)", transition:"all 0.18s" }}
              onMouseEnter={e=>{ e.currentTarget.style.background=T.primaryDark; e.currentTarget.style.transform="translateY(-1px)"; }}
              onMouseLeave={e=>{ e.currentTarget.style.background=T.primary; e.currentTarget.style.transform="translateY(0)"; }}
            ><Upload size={14} />Start Diagnosis<ArrowRight size={13} /></a>
            <a href="/dashboard" style={{ display:"inline-flex", alignItems:"center", gap:7, padding:"12px 18px", background:T.card, border:`1px solid ${T.border}`, borderRadius:10, color:T.textPrimary, fontSize:14, fontWeight:600, textDecoration:"none", transition:"all 0.18s" }}
              onMouseEnter={e=>{ e.currentTarget.style.borderColor=T.primary; e.currentTarget.style.color=T.primary; e.currentTarget.style.background=T.primaryLight; }}
              onMouseLeave={e=>{ e.currentTarget.style.borderColor=T.border; e.currentTarget.style.color=T.textPrimary; e.currentTarget.style.background=T.card; }}
            ><LayoutDashboard size={13} />Dashboard</a>
          </motion.div>

          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.55 }} style={{ display:"flex", gap:18, flexWrap:"wrap" }}>
            {[{icon:Shield,t:"HIPAA Compliant"},{icon:Lock,t:"E2E Encrypted"},{icon:CheckCircle2,t:"94.7% Accuracy"}].map(({icon:Icon,t:label}) => (
              <div key={label} style={{ display:"flex", alignItems:"center", gap:5, color:T.textSecondary, fontSize:11 }}>
                <Icon size={11} color={T.success} />{label}
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Right — 3D, re-keyed on navigation */}
        <motion.div initial={{ opacity:0, scale:0.92 }} animate={{ opacity:1, scale:1 }} transition={{ delay:0.25, duration:0.8 }}
          className="hidden-mobile"
          style={{ width:"100%", height:490, position:"relative", borderRadius:18, overflow:"hidden", border:`1px solid ${T.border}`, background:T.card, boxShadow:"0 8px 36px rgba(26,39,68,0.09), 0 1px 0 rgba(255,255,255,0.8) inset" }}
        >
          <ScanLine />
          <ThreeScene key={sceneKey} />

          <div style={{ position:"absolute", top:11, left:11, display:"flex", flexDirection:"column", gap:5 }}>
            {[{label:"DNA Structure Loaded",color:T.primary},{label:"Grad-CAM Active",color:T.teal},{label:"RL Policy v2 (PPO)",color:"#8B5CF6"}].map(chip => (
              <motion.div key={chip.label} animate={{ opacity:[0.7,1,0.7] }} transition={{ duration:2.5, repeat:Infinity, delay:Math.random() }}
                style={{ display:"flex", alignItems:"center", gap:5, background:"rgba(255,255,255,0.94)", backdropFilter:"blur(8px)", border:`1px solid ${T.border}`, borderRadius:999, padding:"3px 9px", fontSize:9, fontWeight:600, color:chip.color, boxShadow:"0 1px 4px rgba(26,39,68,0.07)" }}
              >
                <span style={{ width:4, height:4, background:chip.color, borderRadius:"50%" }} />{chip.label}
              </motion.div>
            ))}
          </div>

          <div style={{ position:"absolute", bottom:11, left:11, right:11, display:"flex", gap:7, justifyContent:"space-between", alignItems:"center" }}>
            <div style={{ background:"rgba(255,255,255,0.96)", backdropFilter:"blur(8px)", border:`1px solid ${T.border}`, borderRadius:11, padding:"7px 12px", display:"flex", alignItems:"center", gap:11, boxShadow:"0 2px 8px rgba(26,39,68,0.07)" }}>
              <div>
                <div style={{ color:T.textSecondary, fontSize:8, textTransform:"uppercase", letterSpacing:1 }}>Confidence</div>
                <div style={{ color:T.success, fontFamily:"'Sora'", fontSize:19, fontWeight:800, lineHeight:1 }}>87.4%</div>
              </div>
              <div style={{ width:1, height:22, background:T.border }} />
              <div>
                <div style={{ color:T.textSecondary, fontSize:8, textTransform:"uppercase", letterSpacing:1 }}>Diagnosis</div>
                <div style={{ color:T.textPrimary, fontSize:11, fontWeight:700 }}>Pneumonia</div>
              </div>
            </div>
            <motion.div animate={{ opacity:[1,0.4,1] }} transition={{ duration:1.2, repeat:Infinity }}
              style={{ background:"rgba(255,255,255,0.94)", border:`1px solid ${T.border}`, borderRadius:7, padding:"4px 10px", color:T.primary, fontSize:9, fontWeight:700, fontFamily:"monospace" }}
            >■ SCANNING...</motion.div>
          </div>
        </motion.div>
      </div>

      <motion.div animate={{ y:[0,7,0] }} transition={{ duration:1.8, repeat:Infinity }}
        onClick={() => window.scrollTo({ top:window.innerHeight, behavior:"smooth" })}
        style={{ position:"absolute", bottom:22, left:"50%", transform:"translateX(-50%)", color:T.textSecondary, display:"flex", flexDirection:"column", alignItems:"center", gap:4, cursor:"pointer" }}
      >
        <span style={{ fontSize:9, letterSpacing:2, textTransform:"uppercase" }}>Scroll</span>
        <ChevronDown size={12} />
      </motion.div>
    </motion.section>
  );
}

/* ─────────────────────────────────────────
   STATS BAR
───────────────────────────────────────── */
function StatsBar() {
  const STATS = [
    { v:"94.7%", l:"Model Accuracy",  sub:"On 4,200 test cases", c:T.success },
    { v:"128K+", l:"Cases Analyzed",  sub:"Across 47 hospitals",  c:T.primary },
    { v:"3.2s",  l:"Avg Inference",   sub:"GPU accelerated",      c:T.teal },
    { v:"200+",  l:"Clinicians",      sub:"Using the platform",   c:"#8B5CF6" },
    { v:"47",    l:"Hospitals",       sub:"Active deployments",   c:T.warning },
  ];
  return (
    <section id="performance" className="stats-pad" style={{ position:"relative", zIndex:10, background:T.card, borderTop:`1px solid ${T.border}`, borderBottom:`1px solid ${T.border}` }}>
      <div style={{ maxWidth:1200, margin:"0 auto", display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:14 }} className="stats-grid">
        {STATS.map((s,i) => (
          <motion.div key={s.l} initial={{ opacity:0, y:14 }} whileInView={{ opacity:1, y:0 }} transition={{ delay:i*0.07 }} viewport={{ once:true }}
            style={{ textAlign:"center", padding:"18px 8px", background:T.bg, border:`1px solid ${T.border}`, borderRadius:12 }}
          >
            <div style={{ fontFamily:"'Sora'", fontSize:32, fontWeight:800, color:s.c, lineHeight:1 }}>{s.v}</div>
            <div style={{ color:T.textPrimary, fontWeight:600, fontSize:11, marginTop:5 }}>{s.l}</div>
            <div style={{ color:T.textSecondary, fontSize:10, marginTop:2 }}>{s.sub}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   HOW IT WORKS
───────────────────────────────────────── */
function HowItWorks() {
  const STEPS = [
    { n:"01", icon:Upload, title:"Upload Image",        desc:"Drag-drop X-Ray, MRI, CT or DICOM. Instant validation and HIPAA-compliant secure upload.", color:T.primary, bg:T.primaryLight, border:"rgba(59,111,212,0.2)" },
    { n:"02", icon:Cpu,    title:"AI Analysis",         desc:"DenseNet-121 CNN processes your scan in 3.2 seconds with GPU-accelerated inference.",        color:T.teal,    bg:T.tealLight,   border:"rgba(42,157,143,0.2)" },
    { n:"03", icon:Brain,  title:"Prediction",          desc:"PPO RL policy outputs disease probabilities, confidence score, and clinical recommendation.", color:"#8B5CF6", bg:"#F5F0FF",     border:"rgba(139,92,246,0.2)" },
    { n:"04", icon:Eye,    title:"Heatmap Explanation", desc:"Grad-CAM highlights exactly which image regions drove the AI decision.",                     color:T.warning, bg:"#FEF3E8",     border:"rgba(244,162,97,0.2)" },
  ];
  return (
    <section id="how-it-works" className="sec-pad" style={{ position:"relative", zIndex:10, background:T.bg }}>
      <div style={{ maxWidth:1200, margin:"0 auto" }}>
        <motion.div initial={{ opacity:0, y:18 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} style={{ textAlign:"center", marginBottom:48 }}>
          <span style={{ display:"inline-block", background:T.primaryLight, border:`1px solid rgba(59,111,212,0.2)`, borderRadius:999, padding:"4px 13px", color:T.primary, fontSize:10, fontWeight:700, letterSpacing:1.6, textTransform:"uppercase", marginBottom:14 }}>Workflow</span>
          <h2 style={{ fontFamily:"'Sora',system-ui", fontSize:"clamp(22px,2.8vw,36px)", fontWeight:800, color:T.textPrimary, marginBottom:9 }}>How It Works</h2>
          <p style={{ color:T.textSecondary, fontSize:14, maxWidth:400, margin:"0 auto", lineHeight:1.7 }}>From image upload to full explainable diagnosis in under 60 seconds.</p>
        </motion.div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, position:"relative" }} className="steps-grid">
          <div style={{ position:"absolute", top:48, left:"12.5%", right:"12.5%", height:1, background:`linear-gradient(90deg,${T.primary},${T.teal},#8B5CF6,${T.warning})`, opacity:0.22 }} className="connector-line" />
          {STEPS.map((step,i) => {
            const Icon = step.icon;
            return (
              <motion.div key={step.n} initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} transition={{ delay:i*0.1 }} viewport={{ once:true }} style={{ position:"relative", zIndex:1 }}>
                <div style={{ background:T.card, border:`1px solid ${step.border}`, borderRadius:16, padding:"24px 16px", textAlign:"center", transition:"all 0.24s ease", boxShadow:"0 1px 4px rgba(26,39,68,0.05)" }}
                  onMouseEnter={e=>{ const d=e.currentTarget as HTMLDivElement; d.style.background=step.bg; d.style.transform="translateY(-5px)"; d.style.boxShadow="0 10px 30px rgba(26,39,68,0.09)"; }}
                  onMouseLeave={e=>{ const d=e.currentTarget as HTMLDivElement; d.style.background=T.card; d.style.transform="translateY(0)"; d.style.boxShadow="0 1px 4px rgba(26,39,68,0.05)"; }}
                >
                  <div style={{ width:48, height:48, background:step.bg, border:`1px solid ${step.border}`, borderRadius:13, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 13px" }}>
                    <Icon size={21} color={step.color} />
                  </div>
                  <div style={{ fontSize:9, color:step.color, fontWeight:700, letterSpacing:2, textTransform:"uppercase", marginBottom:5 }}>Step {step.n}</div>
                  <div style={{ color:T.textPrimary, fontWeight:700, fontSize:13, marginBottom:7 }}>{step.title}</div>
                  <div style={{ color:T.textSecondary, fontSize:11, lineHeight:1.65 }}>{step.desc}</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   FEATURES
───────────────────────────────────────── */
function Features() {
  const FT = [
    { icon:Brain,    title:"Hybrid CNN + RL Model",     desc:"DenseNet-121 CNN combined with PPO Reinforcement Learning for intelligent, adaptive clinical recommendations.", color:T.primary, bg:T.primaryLight, border:"rgba(59,111,212,0.18)" },
    { icon:Eye,      title:"Explainable AI (Grad-CAM)", desc:"Every prediction comes with a Grad-CAM highlighting which image regions influenced the decision.",               color:T.teal,    bg:T.tealLight,   border:"rgba(42,157,143,0.18)" },
    { icon:Zap,      title:"Fast Predictions",          desc:"GPU-accelerated inference in 3.2 seconds. Supports X-Ray, MRI, CT, and DICOM up to 50MB.",                    color:T.warning, bg:"#FEF3E8",     border:"rgba(244,162,97,0.18)" },
    { icon:History,  title:"Case History Tracking",     desc:"Full audit trail, confidence trends, clinician feedback history, and one-click report generation.",             color:"#8B5CF6", bg:"#F5F0FF",     border:"rgba(139,92,246,0.18)" },
    { icon:Shield,   title:"HIPAA Compliant Security",  desc:"End-to-end encrypted storage, role-based access control, complete audit logging for clinical deployment.",     color:T.success, bg:"#EDFAF2",     border:"rgba(45,198,83,0.18)" },
    { icon:FileText, title:"Auto Clinical Reports",     desc:"One-click PDF reports with scan, Grad-CAM heatmap, diagnosis, confidence, RL recommendation, and feedback.",  color:T.danger,  bg:"#FEF0F1",     border:"rgba(230,57,70,0.18)" },
  ];
  return (
    <section id="features" className="sec-pad" style={{ position:"relative", zIndex:10, background:T.card }}>
      <div style={{ maxWidth:1200, margin:"0 auto" }}>
        <motion.div initial={{ opacity:0, y:18 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} style={{ textAlign:"center", marginBottom:48 }}>
          <span style={{ display:"inline-block", background:T.tealLight, border:"1px solid rgba(42,157,143,0.2)", borderRadius:999, padding:"4px 13px", color:T.teal, fontSize:10, fontWeight:700, letterSpacing:1.6, textTransform:"uppercase", marginBottom:14 }}>Platform Features</span>
          <h2 style={{ fontFamily:"'Sora',system-ui", fontSize:"clamp(22px,2.8vw,36px)", fontWeight:800, color:T.textPrimary, marginBottom:9 }}>Built for Clinical Workflows</h2>
          <p style={{ color:T.textSecondary, fontSize:14, maxWidth:440, margin:"0 auto", lineHeight:1.7 }}>Every feature designed around real medical workflows.</p>
        </motion.div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16 }} className="features-grid">
          {FT.map((f,i) => {
            const Icon = f.icon;
            return (
              <TiltCard key={f.title}>
                <motion.div initial={{ opacity:0, y:18 }} whileInView={{ opacity:1, y:0 }} transition={{ delay:i*0.07 }} viewport={{ once:true }}
                  style={{ background:T.card, border:`1px solid ${f.border}`, borderRadius:14, padding:"24px 20px", transition:"all 0.24s ease", height:"100%", boxShadow:"0 1px 4px rgba(26,39,68,0.05)" }}
                  onMouseEnter={e=>{ const d=e.currentTarget as HTMLDivElement; d.style.background=f.bg; d.style.boxShadow="0 8px 26px rgba(26,39,68,0.09)"; }}
                  onMouseLeave={e=>{ const d=e.currentTarget as HTMLDivElement; d.style.background=T.card; d.style.boxShadow="0 1px 4px rgba(26,39,68,0.05)"; }}
                >
                  <div style={{ width:42, height:42, background:f.bg, border:`1px solid ${f.border}`, borderRadius:11, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:14 }}>
                    <Icon size={19} color={f.color} />
                  </div>
                  <h3 style={{ color:T.textPrimary, fontWeight:700, fontSize:13, marginBottom:7 }}>{f.title}</h3>
                  <p style={{ color:T.textSecondary, fontSize:12, lineHeight:1.7 }}>{f.desc}</p>
                </motion.div>
              </TiltCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   CONDITIONS
───────────────────────────────────────── */
function Conditions() {
  const DS = [
    { name:"Pneumonia",        icd:"J18.9", acc:94 },
    { name:"COVID-19",         icd:"U07.1", acc:96 },
    { name:"Pleural Effusion", icd:"J90",   acc:91 },
    { name:"Cardiomegaly",     icd:"I51.7", acc:89 },
    { name:"Pneumothorax",     icd:"J93.9", acc:92 },
    { name:"Lung Cancer",      icd:"C34.9", acc:87 },
    { name:"Atelectasis",      icd:"J98.1", acc:88 },
    { name:"Pulmonary Edema",  icd:"J81.1", acc:90 },
  ];
  return (
    <section id="conditions" className="sec-pad" style={{ position:"relative", zIndex:10, background:T.bg }}>
      <div style={{ maxWidth:1200, margin:"0 auto" }}>
        <motion.div initial={{ opacity:0, y:18 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} style={{ textAlign:"center", marginBottom:48 }}>
          <span style={{ display:"inline-block", background:"#F5F0FF", border:"1px solid rgba(139,92,246,0.2)", borderRadius:999, padding:"4px 13px", color:"#8B5CF6", fontSize:10, fontWeight:700, letterSpacing:1.6, textTransform:"uppercase", marginBottom:14 }}>Disease Coverage</span>
          <h2 style={{ fontFamily:"'Sora',system-ui", fontSize:"clamp(22px,2.8vw,36px)", fontWeight:800, color:T.textPrimary, marginBottom:9 }}>Detectable Conditions</h2>
          <p style={{ color:T.textSecondary, fontSize:14, maxWidth:440, margin:"0 auto", lineHeight:1.7 }}>Trained on 500,000+ annotated medical images across multiple disease categories.</p>
        </motion.div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }} className="conditions-grid">
          {DS.map((d,i) => (
            <motion.div key={d.name} initial={{ opacity:0, scale:0.94 }} whileInView={{ opacity:1, scale:1 }} transition={{ delay:i*0.06 }} viewport={{ once:true }}
              style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:12, padding:"16px 14px", transition:"all 0.2s ease", boxShadow:"0 1px 4px rgba(26,39,68,0.05)", cursor:"pointer" }}
              onMouseEnter={e=>{ const el=e.currentTarget as HTMLDivElement; el.style.borderColor=T.primary; el.style.transform="translateY(-3px)"; el.style.boxShadow="0 7px 20px rgba(59,111,212,0.12)"; }}
              onMouseLeave={e=>{ const el=e.currentTarget as HTMLDivElement; el.style.borderColor=T.border; el.style.transform="translateY(0)"; el.style.boxShadow="0 1px 4px rgba(26,39,68,0.05)"; }}
            >
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:9 }}>
                <Microscope size={14} color={T.primary} />
                <span style={{ fontSize:9, color:T.success, fontWeight:700, background:"#EDFAF2", padding:"2px 6px", borderRadius:999 }}>{d.acc}%</span>
              </div>
              <div style={{ color:T.textPrimary, fontWeight:700, fontSize:12, marginBottom:2 }}>{d.name}</div>
              <div style={{ color:T.textSecondary, fontSize:9, fontFamily:"monospace", marginBottom:9 }}>ICD-10: {d.icd}</div>
              <div style={{ height:2.5, background:T.border, borderRadius:999, overflow:"hidden" }}>
                <motion.div initial={{ width:0 }} whileInView={{ width:`${d.acc}%` }} transition={{ duration:0.9, delay:i*0.06 }} viewport={{ once:true }}
                  style={{ height:"100%", background:`linear-gradient(90deg,${T.primary},${T.teal})`, borderRadius:999 }} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   DEMO CARD
───────────────────────────────────────── */
function DemoCard() {
  return (
    <section className="sec-pad" style={{ position:"relative", zIndex:10, background:T.card }}>
      <div style={{ maxWidth:1200, margin:"0 auto" }}>
        <TiltCard>
          <div style={{ background:T.bg, border:`1px solid ${T.border}`, borderRadius:20, padding:"40px", display:"grid", gridTemplateColumns:"1fr 1fr", gap:40, alignItems:"center", position:"relative", overflow:"hidden", boxShadow:"0 2px 10px rgba(26,39,68,0.06)" }} className="demo-grid">
            <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:`linear-gradient(90deg,${T.primary},${T.teal})` }} />
            <div>
              <div style={{ display:"inline-flex", alignItems:"center", gap:5, background:"#EDFAF2", border:"1px solid rgba(45,198,83,0.2)", borderRadius:999, padding:"3px 11px", marginBottom:18 }}>
                <span style={{ width:5, height:5, background:T.success, borderRadius:"50%", animation:"ldPulse 2s infinite" }} />
                <span style={{ color:T.success, fontSize:10, fontWeight:700 }}>Live Demo Analysis</span>
              </div>
              <h2 style={{ fontFamily:"'Sora'", fontSize:28, fontWeight:800, color:T.textPrimary, marginBottom:10, lineHeight:1.22 }}>See Symptoms AI in Action</h2>
              <p style={{ color:T.textSecondary, fontSize:13, lineHeight:1.74, marginBottom:22 }}>Upload any chest X-Ray and watch the CNN model analyze it in real-time.</p>
              <a href="/upload" style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"11px 20px", background:T.primary, borderRadius:9, color:"white", fontSize:13, fontWeight:700, textDecoration:"none", boxShadow:"0 3px 10px rgba(59,111,212,0.26)", transition:"all 0.18s" }}
                onMouseEnter={e=>{ e.currentTarget.style.background=T.primaryDark; }}
                onMouseLeave={e=>{ e.currentTarget.style.background=T.primary; }}
              >Start Diagnosis<ArrowRight size={13} /></a>
            </div>
            <div style={{ background:T.textPrimary, borderRadius:12, padding:"16px", fontFamily:"monospace", boxShadow:"0 4px 16px rgba(26,39,68,0.14)" }}>
              <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:12 }}>
                <div style={{ width:7, height:7, background:T.danger,  borderRadius:"50%" }} />
                <div style={{ width:7, height:7, background:T.warning, borderRadius:"50%" }} />
                <div style={{ width:7, height:7, background:T.success, borderRadius:"50%" }} />
                <span style={{ color:"rgba(255,255,255,0.28)", fontSize:9, marginLeft:6 }}>symptoms-ai.model</span>
              </div>
              {[
                { l:"Model",         v:"DenseNet-121",          c:"#7EB0FF" },
                { l:"Input",         v:"chest_xray_4821.dcm",   c:"rgba(255,255,255,0.45)" },
                { l:"Preprocessing", v:"✓ Normalized 224×224",  c:T.success },
                { l:"CNN Inference", v:"✓ 3.1s (GPU)",          c:T.success },
                { l:"Grad-CAM",      v:"✓ Generated",           c:T.success },
                { l:"Prediction",    v:"Pneumonia (87.4%)",      c:T.warning },
                { l:"RL Action",     v:"→ Confirm Diagnosis",   c:T.teal },
              ].map(row => (
                <div key={row.l} style={{ display:"flex", justifyContent:"space-between", padding:"4px 0", borderBottom:"1px solid rgba(255,255,255,0.04)", fontSize:10 }}>
                  <span style={{ color:"rgba(255,255,255,0.32)" }}>{row.l}</span>
                  <span style={{ color:row.c, fontWeight:600 }}>{row.v}</span>
                </div>
              ))}
              <motion.div animate={{ opacity:[1,0,1] }} transition={{ duration:1.1, repeat:Infinity }}
                style={{ color:T.primary, fontSize:10, marginTop:7 }}>█ Ready for next image...</motion.div>
            </div>
          </div>
        </TiltCard>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   TESTIMONIALS
───────────────────────────────────────── */
function Testimonials() {
  const TS = [
    { name:"Dr. Sarah Chen",   role:"Chief Radiologist, City General Hospital", text:"Symptoms AI reduced our diagnostic turnaround by 40%. The Grad-CAM overlays give us confidence to trust AI recommendations in critical cases.", rating:5, initials:"SC", color:T.primary },
    { name:"Dr. James Okafor", role:"Pulmonologist, Metro Medical Center",      text:"The RL recommendations are remarkably accurate. It feels like having a second expert opinion instantly available for every scan.",             rating:5, initials:"JO", color:T.teal },
    { name:"Dr. Priya Nair",   role:"Resident Physician, University Hospital",  text:"As a resident, the explainability features help me understand exactly why the AI makes each decision. Invaluable for clinical learning.",        rating:5, initials:"PN", color:"#8B5CF6" },
  ];
  return (
    <section className="sec-pad" style={{ position:"relative", zIndex:10, background:T.bg }}>
      <div style={{ maxWidth:1200, margin:"0 auto" }}>
        <motion.div initial={{ opacity:0, y:18 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} style={{ textAlign:"center", marginBottom:48 }}>
          <h2 style={{ fontFamily:"'Sora',system-ui", fontSize:"clamp(22px,2.8vw,36px)", fontWeight:800, color:T.textPrimary, marginBottom:7 }}>Trusted by Clinicians</h2>
          <p style={{ color:T.textSecondary, fontSize:14 }}>Hear from the doctors using Symptoms AI every day.</p>
        </motion.div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16 }} className="testimonials-grid">
          {TS.map((t,i) => (
            <motion.div key={t.name} initial={{ opacity:0, y:18 }} whileInView={{ opacity:1, y:0 }} transition={{ delay:i*0.09 }} viewport={{ once:true }}
              style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:14, padding:"24px", boxShadow:"0 1px 4px rgba(26,39,68,0.05)", borderTop:`3px solid ${t.color}` }}
            >
              <div style={{ display:"flex", gap:2, marginBottom:12 }}>
                {Array.from({ length:t.rating }).map((_,j) => <Star key={j} size={11} color={T.warning} fill={T.warning} />)}
              </div>
              <p style={{ color:T.textSecondary, fontSize:12, lineHeight:1.76, marginBottom:18, fontStyle:"italic" }}>"{t.text}"</p>
              <div style={{ display:"flex", alignItems:"center", gap:9 }}>
                <div style={{ width:36, height:36, background:`linear-gradient(135deg,${t.color},${T.teal})`, borderRadius:9, display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontSize:11, fontWeight:800, flexShrink:0 }}>{t.initials}</div>
                <div>
                  <div style={{ color:T.textPrimary, fontWeight:700, fontSize:12 }}>{t.name}</div>
                  <div style={{ color:T.textSecondary, fontSize:10, marginTop:1 }}>{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   FINAL CTA
───────────────────────────────────────── */
function FinalCTA() {
  return (
    <section className="sec-pad" style={{ position:"relative", zIndex:10, background:T.card }}>
      <div style={{ maxWidth:800, margin:"0 auto" }}>
        <motion.div initial={{ opacity:0, y:18 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}>
          <div style={{ background:`linear-gradient(135deg,${T.sidebar} 0%,#243356 100%)`, borderRadius:20, padding:"48px 40px", textAlign:"center", position:"relative", overflow:"hidden" }} className="cta-inner">
            <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:`linear-gradient(90deg,${T.primary},${T.teal})` }} />
            <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", opacity:0.04 }}>
              <defs><pattern id="ctap" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0L0 0 0 40" fill="none" stroke="white" strokeWidth="0.6"/></pattern></defs>
              <rect width="100%" height="100%" fill="url(#ctap)"/>
            </svg>
            <h2 style={{ fontFamily:"'Sora',system-ui", fontSize:"clamp(22px,2.8vw,36px)", fontWeight:800, color:"#fff", marginBottom:11, lineHeight:1.22, position:"relative" }}>
              Ready to Run Your First<br />
              <span style={{ background:`linear-gradient(135deg,${T.primary},${T.teal})`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>AI Diagnosis?</span>
            </h2>
            <p style={{ color:"rgba(255,255,255,0.55)", fontSize:14, marginBottom:28, maxWidth:360, margin:"0 auto 28px", lineHeight:1.7, position:"relative" }}>Upload a medical image and get an explainable AI prediction in under 60 seconds.</p>
            <div style={{ display:"flex", gap:9, justifyContent:"center", flexWrap:"wrap", position:"relative" }}>
              <a href="/upload" style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"12px 24px", background:T.primary, borderRadius:9, color:"white", fontSize:13, fontWeight:700, textDecoration:"none", boxShadow:"0 4px 14px rgba(59,111,212,0.38)", transition:"all 0.18s" }}
                onMouseEnter={e=>{ e.currentTarget.style.background=T.primaryDark; e.currentTarget.style.transform="translateY(-1px)"; }}
                onMouseLeave={e=>{ e.currentTarget.style.background=T.primary; e.currentTarget.style.transform="translateY(0)"; }}
              ><Upload size={14} />Start Diagnosis<ArrowRight size={13} /></a>
              <a href="/login" style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"12px 20px", background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.14)", borderRadius:9, color:"rgba(255,255,255,0.82)", fontSize:13, fontWeight:600, textDecoration:"none", transition:"all 0.18s" }}
                onMouseEnter={e=>{ e.currentTarget.style.background="rgba(255,255,255,0.14)"; }}
                onMouseLeave={e=>{ e.currentTarget.style.background="rgba(255,255,255,0.08)"; }}
              ><Lock size={13} />Sign In</a>
            </div>
            <p style={{ color:"rgba(255,255,255,0.22)", fontSize:10, marginTop:18, position:"relative" }}>Access granted to verified clinical personnel only. All activity is logged.</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   ROOT
───────────────────────────────────────── */
export default function LandingPage() {
  const pathname = usePathname();
  const [sidebarOpen,      setSidebarOpen]      = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Re-init canvas + Three.js whenever user returns to "/".
  // Also reset scroll so framer-motion hero opacity is not stuck at 0.
  const [sceneKey, setSceneKey]   = useState(0);
  const [pageReady, setPageReady] = useState(false);

  useEffect(() => {
    if (pathname !== "/") return;

    setPageReady(false);
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    const frame = requestAnimationFrame(() => {
      setSceneKey((k) => k + 1);
      setPageReady(true);
    });
    return () => cancelAnimationFrame(frame);
  }, [pathname]);

  const sbW = sidebarCollapsed ? T.sidebarC : T.sidebarW;

  return (
    <div style={{ minHeight:"100vh", background:T.bg, fontFamily:"'DM Sans',system-ui,sans-serif", overflowX:"hidden" }}>
      {pageReady && <BackgroundCanvas key={sceneKey} id={sceneKey} />}

      <Sidebar
        open={sidebarOpen}
        collapsed={sidebarCollapsed}
        onClose={() => setSidebarOpen(false)}
        onToggleCollapse={() => setSidebarCollapsed(c => !c)}
      />
      <TopBar onMenuClick={() => setSidebarOpen(s => !s)} />

      <main>
        <Hero sceneKey={sceneKey} pageReady={pageReady} />
        <StatsBar />
        <HowItWorks />
        <Features />
        <Conditions />
        <DemoCard />
        <Testimonials />
        <FinalCTA />
      </main>

      <footer className="footer-pad" style={{ position:"relative", zIndex:10, background:T.sidebar, display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:10 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:28, height:28, background:`linear-gradient(135deg,${T.primary},${T.teal})`, borderRadius:7, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Activity size={13} color="white" />
          </div>
          <span style={{ color:"rgba(255,255,255,0.82)", fontFamily:"'Sora'", fontWeight:700, fontSize:12 }}>Symptoms AI</span>
        </div>
        <div style={{ color:"rgba(255,255,255,0.26)", fontSize:10 }} className="tb-sub">© 2026 Symptoms AI · Clinical Decision Support Only · Not a substitute for medical judgment</div>
        <div style={{ display:"flex", gap:10, color:"rgba(255,255,255,0.26)", fontSize:10 }}><span>HIPAA</span><span>·</span><span>v1.0.0</span></div>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        @keyframes ldPulse{0%,100%{opacity:1;transform:scale(1);}50%{opacity:0.5;transform:scale(0.78);}}
        @keyframes ldSpin{to{transform:rotate(360deg)}}
        ::-webkit-scrollbar{width:5px;}
        ::-webkit-scrollbar-track{background:${T.bg};}
        ::-webkit-scrollbar-thumb{background:rgba(59,111,212,0.28);border-radius:3px;}

        /* Sidebar always visible on desktop */
        @media(min-width:1100px){
          .sidebar-panel{transform:translateX(0)!important;}
          .sidebar-close-btn{display:none!important;}
          .tb-anchors,.tb-div{display:flex!important;}
          main,footer{transition:margin-left 0.26s cubic-bezier(0.4,0,0.2,1);}
        }
        @media(max-width:1099px){
          .tb-anchors,.tb-div{display:none!important;}
          .tb-auth{display:none!important;}
          main,footer{margin-left:0!important;}
        }
        @media(min-width:540px){.tb-auth{display:flex!important;}}

        /* Section padding */
        .sec-pad{padding:80px 36px;}
        .hero-pad{padding:76px 36px 56px;}
        .stats-pad{padding:44px 36px;}
        .footer-pad{padding:26px 36px;}
        @media(max-width:900px){
          .sec-pad{padding:60px 24px!important;}
          .hero-pad{padding:76px 24px 44px!important;}
          .stats-pad{padding:34px 24px!important;}
        }
        @media(max-width:600px){
          .sec-pad{padding:44px 14px!important;}
          .hero-pad{padding:72px 14px 36px!important;}
          .stats-pad{padding:26px 14px!important;}
          .footer-pad{padding:18px 14px!important;}
        }

        /* Grids */
        @media(max-width:1000px){.stats-grid{grid-template-columns:repeat(3,1fr)!important;}.conditions-grid{grid-template-columns:repeat(2,1fr)!important;}}
        @media(max-width:768px){
          .hero-grid,.demo-grid{grid-template-columns:1fr!important;}
          .steps-grid{grid-template-columns:repeat(2,1fr)!important;}
          .features-grid,.testimonials-grid{grid-template-columns:1fr!important;}
          .connector-line{display:none!important;}
          .stats-grid{grid-template-columns:repeat(2,1fr)!important;}
          .hidden-mobile{display:none!important;}
          .cta-inner{padding:32px 20px!important;}
          .demo-grid{gap:22px!important;padding:28px!important;}
        }
        @media(max-width:540px){
          .steps-grid{grid-template-columns:1fr!important;}
          .conditions-grid{grid-template-columns:repeat(2,1fr)!important;}
          .hero-btns{flex-direction:column!important;}
          .hero-btns a{width:100%;justify-content:center!important;}
          .tb-sub{display:none!important;}
        }
        @media(max-width:400px){.conditions-grid,.stats-grid{grid-template-columns:1fr!important;}}
      `}</style>

      {/* Dynamic sidebar offset — injected as separate style so it reacts to collapse state */}
      <style>{`
        @media(min-width:1100px){
          main,footer{margin-left:${sbW}px;}
        }
      `}</style>
    </div>
  );
}