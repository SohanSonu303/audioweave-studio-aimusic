export const CLERK_APPEARANCE = {
  layout: {
    unsafe_disableDevelopmentModeWarnings: true,
  },
  variables: {
    colorBackground: "#161616",
    colorInputBackground: "#111111",
    colorText: "#eeeeee",
    colorTextSecondary: "#888888",
    colorTextOnPrimaryBackground: "#000000",
    colorPrimary: "#e8a055",
    colorDanger: "#e06060",
    colorNeutral: "#555555",
    fontFamily: "'Inter', system-ui, sans-serif",
    borderRadius: "8px",
    fontSize: "14px",
    spacingUnit: "16px",
  },
  elements: {
    card: {
      background: "#161616",
      border: "1px solid rgba(255,255,255,0.07)",
      boxShadow:
        "0 0 0 0.5px rgba(255,255,255,0.05) inset, 0 1px 2px rgba(0,0,0,0.4), 0 4px 24px rgba(0,0,0,0.5)",
      borderRadius: "16px",
    },
    headerTitle: {
      color: "#eeeeee",
      fontWeight: "300",
      letterSpacing: "-0.3px",
      fontSize: "22px",
    },
    headerSubtitle: {
      color: "#888888",
      fontSize: "13px",
    },
    socialButtonsBlockButton: {
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.09)",
      color: "#eeeeee",
      borderRadius: "8px",
      transition: "all 0.15s",
    },
    socialButtonsBlockButtonText: {
      color: "#eeeeee",
      fontSize: "13px",
      fontWeight: "500",
    },
    formFieldLabel: {
      color: "#888888",
      fontSize: "11px",
      textTransform: "uppercase" as const,
      letterSpacing: "0.06em",
      fontWeight: "500",
    },
    formFieldInput: {
      background: "#111111",
      border: "1px solid rgba(255,255,255,0.09)",
      color: "#eeeeee",
      borderRadius: "8px",
      fontSize: "14px",
      transition: "border-color 0.15s",
    },
    formButtonPrimary: {
      background: "#e8a055",
      color: "#000000",
      fontWeight: "600",
      borderRadius: "9999px",
      boxShadow: "0 2px 12px rgba(232,160,85,0.25)",
      fontSize: "14px",
      transition: "opacity 0.15s",
    },
    footerActionLink: {
      color: "#e8a055",
      fontWeight: "500",
    },
    footerActionText: {
      color: "#888888",
      fontSize: "13px",
    },
    identityPreviewEditButton: {
      color: "#e8a055",
    },
    dividerLine: {
      background: "rgba(255,255,255,0.07)",
    },
    dividerText: {
      color: "#505050",
      fontSize: "11px",
      textTransform: "uppercase" as const,
      letterSpacing: "0.06em",
    },
    // "Last Used" badge on social buttons — white text
    badge: {
      color: "#ffffff",
      background: "rgba(255,255,255,0.08)",
      border: "1px solid rgba(255,255,255,0.12)",
    },
    // Hide Clerk-secured footer
    footer: { display: "none" },
  },
};
