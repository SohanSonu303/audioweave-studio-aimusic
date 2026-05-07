"use client";

import { useState, cloneElement, isValidElement } from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { Icon, icons } from "@/components/ui/icon";

const SECTIONS = [
  {
    num: "1",
    title: "Description of Service",
    icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
    content: [
      "AUDIOWEAVE STUDIO provides artificial intelligence tools that allow users to generate music tracks, songs, instrumentals, sound effects (SFX), audio stems, AI-generated compositions, and audio editing features.",
      "The Service may use proprietary AI systems as well as third-party licensed APIs. We continuously improve our technology and may modify features at any time.",
    ],
  },
  {
    num: "2",
    title: "Eligibility",
    icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
    content: [
      "You must be at least 13 years old to use our Service. If you are under 18, you must have permission from a parent or guardian.",
      "You agree that you will provide accurate account information, will not use the Service for illegal purposes, and will comply with all applicable laws.",
    ],
  },
  {
    num: "3",
    title: "Account Registration",
    icon: "M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z",
    content: [
      "To access certain features, you may need to create an account. You are responsible for maintaining confidentiality of your account, all activities that occur under your account, and keeping your login credentials secure.",
      "We reserve the right to suspend accounts that violate these Terms.",
    ],
  },
  {
    num: "4",
    title: "AI Generated Content",
    icon: "M13 10V3L4 14h7v7l9-11h-7z",
    content: [
      "AUDIOWEAVE STUDIO allows users to create audio content using artificial intelligence. Generated content is created algorithmically and similar outputs may be generated for multiple users.",
      "We do not guarantee uniqueness of generated music. Outputs may contain similarities to existing styles or genres. Users are responsible for reviewing generated content before commercial use.",
    ],
  },
  {
    num: "5",
    title: "Ownership & Rights",
    icon: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z",
    subsections: [
      {
        label: "Free Plan Users",
        text: "Receive a limited, non-exclusive license for personal projects, social media content, and non-commercial use only. Commercial usage is not permitted under the free plan.",
        badge: "Free",
        badgeColor: "rgba(255,255,255,0.08)",
        badgeTextColor: "var(--aw-text-3)",
      },
      {
        label: "Paid Plans (Basic, Pro, Premium)",
        text: "Pro and Premium subscribers receive commercial rights to use generated music in YouTube videos, films, games, advertisements, podcasts, social media, and apps. Commercial rights apply only during an active subscription.",
        badge: "Pro & Premium",
        badgeColor: "rgba(232,160,85,0.15)",
        badgeTextColor: "var(--aw-accent)",
      },
    ],
    content: [
      "Ownership applies only to the final generated output, not the underlying AI models or technology.",
    ],
  },
  {
    num: "6",
    title: "Third-Party APIs & Technology",
    icon: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4",
    content: [
      "AUDIOWEAVE STUDIO may use third-party APIs or licensed technologies including AI model providers, cloud infrastructure, and audio processing technologies. All integrations are used legally under commercial licensing agreements.",
      "We do not guarantee uninterrupted availability of third-party services. Changes in third-party policies may affect certain features and we are not liable for disruptions caused by third-party services.",
    ],
  },
  {
    num: "7",
    title: "Prohibited Uses",
    icon: "M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636",
    content: [
      "You agree NOT to generate content that violates copyright laws, copies specific artists or songs intentionally, contains illegal or harmful material, promotes violence, hate, or discrimination, or violates intellectual property rights.",
      "You may not resell the Service, provide API access to others without permission, attempt to reverse engineer our AI systems, or claim ownership of our AI technology.",
    ],
  },
  {
    num: "8",
    title: "Copyright Policy",
    icon: "M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z",
    content: [
      "Users are responsible for ensuring their prompts do not intentionally copy copyrighted works. Do not request content such as \"Create song exactly like Artist X\" or \"Copy melody from Song Y.\"",
      "AUDIOWEAVE STUDIO respects intellectual property rights. If you believe content infringes your copyright, contact us at foundrxlabs@gmail.com.",
    ],
  },
  {
    num: "9",
    title: "Subscription & Payments",
    icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z",
    content: [
      "We offer Free, Basic, Pro, and Premium pricing plans. Pricing may change at any time. Payments are processed securely through third-party payment providers.",
      "Subscriptions may automatically renew unless cancelled. Refunds are not guaranteed unless required by law.",
    ],
  },
  {
    num: "10",
    title: "Limitation of Liability",
    icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
    content: [
      "AUDIOWEAVE STUDIO is not liable for business losses, lost profits, copyright disputes caused by user prompts, third-party API downtime, or generated content similarity claims.",
      "The Service is provided \"as is\" without warranties of any kind.",
    ],
  },
  {
    num: "11",
    title: "Termination",
    icon: "M6 18L18 6M6 6l12 12",
    content: [
      "We may suspend or terminate access if users violate these Terms, abuse the platform, attempt fraudulent activity, or use the service illegally. Users may cancel subscriptions at any time.",
    ],
  },
  {
    num: "12",
    title: "Changes to Terms & Governing Law",
    icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
    content: [
      "We may update these Terms periodically. Continued use of the Service indicates acceptance of updated Terms.",
      "These Terms are governed by applicable international laws. Users are responsible for compliance with their local regulations.",
    ],
  },
];

type Subsection = {
  label: string;
  text: string;
  badge: string;
  badgeColor: string;
  badgeTextColor: string;
};

function SvgIcon({ d }: { d: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

export function TermsModal({ trigger }: { trigger: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  const triggerWithClick = isValidElement(trigger)
    ? cloneElement(trigger as React.ReactElement<{ onClick?: () => void }>, {
        onClick: () => setOpen(true),
      })
    : trigger;

  return (
    <>
      {triggerWithClick}

      <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Backdrop
            className="fixed inset-0 z-50"
            style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
          />

          <DialogPrimitive.Popup
            className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 flex flex-col outline-none"
            style={{
              width: "min(760px, 95vw)",
              maxHeight: "88vh",
              background: "var(--aw-surface)",
              border: "1px solid var(--aw-border)",
              borderRadius: "16px",
              boxShadow: "0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)",
            }}
          >
            {/* Header */}
            <div
              className="flex-shrink-0 px-7 pt-6 pb-5"
              style={{ borderBottom: "1px solid var(--aw-border)" }}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-7 h-7 rounded-[8px] flex items-center justify-center flex-shrink-0"
                      style={{
                        background: "linear-gradient(135deg, var(--aw-accent), #a070e0)",
                        boxShadow: "0 2px 12px rgba(232,160,85,0.3)",
                      }}
                    >
                      <Icon d={icons.waveform} size={13} color="white" />
                    </div>
                    <span
                      className="text-[11px] font-semibold uppercase tracking-[0.1em]"
                      style={{ color: "var(--aw-accent)" }}
                    >
                      AudioWeave Studio
                    </span>
                  </div>
                  <DialogPrimitive.Title
                    className="text-[22px] font-bold tracking-[-0.03em]"
                    style={{ color: "var(--aw-text)" }}
                  >
                    Terms of Service
                  </DialogPrimitive.Title>
                  <DialogPrimitive.Description
                    className="text-[13px] mt-1"
                    style={{ color: "var(--aw-text-3)" }}
                  >
                    Effective Date: May 4, 2026 · Last updated: May 2026
                  </DialogPrimitive.Description>
                </div>

                <button
                  onClick={() => setOpen(false)}
                  className="flex-shrink-0 w-8 h-8 rounded-[8px] flex items-center justify-center transition-colors cursor-pointer"
                  style={{ color: "var(--aw-text-3)", background: "rgba(255,255,255,0.04)", border: "none" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                    e.currentTarget.style.color = "var(--aw-text)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                    e.currentTarget.style.color = "var(--aw-text-3)";
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Welcome blurb */}
              <p
                className="text-[13px] leading-[1.6] mt-4 p-3 rounded-[10px]"
                style={{
                  color: "var(--aw-text-2)",
                  background: "rgba(232,160,85,0.06)",
                  border: "1px solid rgba(232,160,85,0.12)",
                }}
              >
                Welcome to AUDIOWEAVE STUDIO. These Terms of Service govern your access to and use of our website, products, and services, including AI-powered music, song, and sound effect generation tools. By accessing or using AUDIOWEAVE STUDIO, you agree to be bound by these Terms.
              </p>
            </div>

            {/* Scrollable body */}
            <div
              className="flex-1 overflow-y-auto px-7 py-5"
              style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.1) transparent" }}
            >
              <div className="flex flex-col gap-5">
                {SECTIONS.map((section) => (
                  <div
                    key={section.num}
                    className="rounded-[12px] overflow-hidden"
                    style={{ border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}
                  >
                    {/* Section header row */}
                    <div
                      className="flex items-center gap-3 px-5 py-3"
                      style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", background: "rgba(255,255,255,0.02)" }}
                    >
                      <div
                        className="w-6 h-6 rounded-[6px] flex items-center justify-center flex-shrink-0"
                        style={{ background: "rgba(232,160,85,0.12)", color: "var(--aw-accent)" }}
                      >
                        <SvgIcon d={section.icon} />
                      </div>
                      <div className="flex items-center gap-2 flex-1">
                        <span
                          className="text-[10px] font-bold tabular-nums"
                          style={{ color: "var(--aw-accent)", opacity: 0.6 }}
                        >
                          §{section.num}
                        </span>
                        <h3
                          className="text-[13px] font-semibold tracking-[-0.01em]"
                          style={{ color: "var(--aw-text)" }}
                        >
                          {section.title}
                        </h3>
                      </div>
                    </div>

                    {/* Section body */}
                    <div className="px-5 py-4 flex flex-col gap-3">
                      {"subsections" in section && section.subsections && (
                        <div className="flex flex-col gap-2 mb-1">
                          {(section.subsections as Subsection[]).map((sub) => (
                            <div
                              key={sub.label}
                              className="rounded-[8px] px-4 py-3"
                              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
                            >
                              <div className="flex items-center gap-2 mb-1.5">
                                <span
                                  className="text-[10px] font-bold uppercase tracking-[0.06em] px-[6px] py-[2px] rounded-[4px]"
                                  style={{ background: sub.badgeColor, color: sub.badgeTextColor }}
                                >
                                  {sub.badge}
                                </span>
                                <span className="text-[12px] font-medium" style={{ color: "var(--aw-text)" }}>
                                  {sub.label}
                                </span>
                              </div>
                              <p className="text-[12px] leading-[1.65]" style={{ color: "var(--aw-text-2)" }}>
                                {sub.text}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                      {section.content.map((para, i) => (
                        <p key={i} className="text-[12.5px] leading-[1.7]" style={{ color: "var(--aw-text-2)" }}>
                          {para}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Additional policies block */}
                <div
                  className="rounded-[12px] p-5"
                  style={{ border: "1px solid rgba(232,160,85,0.15)", background: "rgba(232,160,85,0.04)" }}
                >
                  <h3 className="text-[13px] font-semibold mb-3 flex items-center gap-2" style={{ color: "var(--aw-accent)" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 16v-4M12 8h.01" />
                    </svg>
                    Additional Policies
                  </h3>
                  <div className="flex flex-col gap-2">
                    {[
                      { label: "AI Disclaimer", text: "AI-generated audio may not always meet expectations of musical quality or originality." },
                      { label: "Content Moderation", text: "We may remove content that violates our policies without prior notice." },
                      { label: "Fair Usage Policy", text: "We may limit excessive usage to ensure system stability for all users." },
                    ].map((p) => (
                      <div key={p.label} className="flex gap-2.5">
                        <div
                          className="w-1 rounded-full flex-shrink-0 mt-1"
                          style={{ background: "var(--aw-accent)", opacity: 0.5, minHeight: "14px" }}
                        />
                        <p className="text-[12.5px] leading-[1.65]" style={{ color: "var(--aw-text-2)" }}>
                          <span className="font-medium" style={{ color: "var(--aw-text)" }}>{p.label}: </span>
                          {p.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div
              className="flex-shrink-0 px-7 py-4 flex items-center justify-between gap-4"
              style={{ borderTop: "1px solid var(--aw-border)" }}
            >
              <p className="text-[11px]" style={{ color: "var(--aw-text-3)" }}>
                Questions?&nbsp;
                <a
                  href="mailto:foundrxlabs@gmail.com"
                  className="underline underline-offset-2"
                  style={{ color: "var(--aw-accent)" }}
                >
                  foundrxlabs@gmail.com
                </a>
              </p>
              <button
                onClick={() => setOpen(false)}
                className="px-5 py-2 rounded-[8px] text-[12px] font-semibold text-black transition-opacity hover:opacity-85 cursor-pointer"
                style={{ background: "var(--aw-accent)", border: "none" }}
              >
                I Understand
              </button>
            </div>
          </DialogPrimitive.Popup>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </>
  );
}
