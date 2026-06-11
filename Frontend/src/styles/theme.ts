export const theme = {
  colors: {
    background: "#F5F7FB",
    card: "#FFFFFF",
    sidebar: "#1A2744",
    primary: {
      DEFAULT: "#3B6FD4",
      light: "#EEF3FC",
      dark: "#2A57B8",
    },
    teal: {
      DEFAULT: "#2A9D8F",
      light: "#E8F6F4",
    },
    success: "#2DC653",
    warning: "#F4A261",
    danger: "#E63946",
    text: {
      primary: "#1A2744",
      secondary: "#64748B",
      muted: "#94A3B8",
    },
    border: "#E2E8F0",
    accent: "#7EB0FF",
  },
  fonts: {
    sans: "'DM Sans', system-ui, sans-serif",
    display: "'Sora', system-ui, sans-serif",
    mono: "'JetBrains Mono', monospace",
  },
  radius: {
    sm: "8px",
    md: "12px",
    lg: "16px",
    xl: "20px",
    full: "9999px",
  },
  shadow: {
    card: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)",
    cardHover: "0 4px 12px rgba(0,0,0,0.08), 0 12px 32px rgba(0,0,0,0.06)",
    modal: "0 24px 64px rgba(0,0,0,0.16)",
    sidebar: "4px 0 24px rgba(0,0,0,0.12)",
  },
  transition: {
    fast: "0.15s ease",
    base: "0.2s ease",
    slow: "0.4s ease",
  },
} as const;

export type Theme = typeof theme;