export const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  aiServiceURL: process.env.NEXT_PUBLIC_AI_SERVICE_URL || "http://localhost:8000",
  timeout: 120_000,
  endpoints: {
    auth: {
      login: "/auth/login",
      register: "/auth/register",
      logout: "/auth/logout",
      me: "/auth/me",
      refresh: "/auth/refresh",
    },
    predictions: { predict: "/predict" },
    feedback: {
      submit: "/feedback",
      byCaseId: (caseId: string) => `/feedback/case/${caseId}`,
      escalate: "/feedback/escalate",
    },
    cases: {
      list: "/cases",
      getById: (id: string) => `/cases/${id}`,
    },
    reports: {
      getByCaseId: (caseId: string) => `/reports/${caseId}`,
      downloadText: (caseId: string) => `/reports/${caseId}/text`,
      downloadHtml: (caseId: string) => `/reports/${caseId}/html`,
    },
    admin: {
      overview: "/admin/overview",
    },
    system: { status: "/system/status" },
    health: "/health",
  },
} as const;
