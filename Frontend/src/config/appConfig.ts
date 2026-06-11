export const APP_CONFIG = {
  name: "MedPredict AI",
  version: "1.0.0",
  description: "Clinical Decision-Support Platform powered by CNN + Reinforcement Learning",
  institution: "City General Hospital",

  // Feature flags
  features: {
    webGL3D: true,
    gradCAM: true,
    rlRecommendations: true,
    multiFileUpload: true,
    pdfExport: true,
    seniorEscalation: true,
  },

  // Clinical thresholds
  thresholds: {
    lowConfidence: 70,        // below → alert
    highConfidence: 85,       // above → high confidence badge
    escalationConfidence: 60, // below → auto-suggest escalation
  },

  // UI settings
  ui: {
    sidebarDefaultOpen: true,
    maxUploadFiles: 10,
    animationsEnabled: true,
  },

  // Compliance
  compliance: {
    hipaa: true,
    gdpr: true,
    auditLogging: true,
  },
} as const;