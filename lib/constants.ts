import { icons } from "@/components/ui/icon";

export const NAV = [
  { id: "home", label: "Home", href: "/", icon: icons.home },
  { id: "generate", label: "Generate", href: "/generate", icon: icons.bolt },
  { id: "library", label: "Library", href: "/library", icon: icons.library },
  { id: "album", label: "Album", href: "/album", icon: icons.film },
  { id: "stems", label: "Stem Separation", href: "/stems", icon: icons.scissors },
  { id: "edit", label: "Edit", href: "/edit", icon: icons.wand },
] as const;

export const STYLE_TAGS: Record<string, string[]> = {
  Song: ["Pop", "R&B", "Hip-Hop", "Ballad", "Country", "Folk", "Indie", "Soul", "Jazz", "Blues", "Rock", "Punk", "Metal", "Gospel", "Latin", "K-Pop"],
  Music: ["Cinematic", "Orchestral", "Ambient", "Lo-Fi", "Electronic", "House", "Techno", "Drum & Bass", "Synthwave", "Classical", "Jazz", "Trap", "Future Bass", "Chillout"],
  "Sound FX": ["Nature", "Urban", "Sci-Fi", "Horror", "Comedy", "Foley", "Transitions", "UI Sounds", "Impact", "Ambience", "Mechanical", "Organic"],
};

export const PLANS = [
  {
    id: "free",
    name: "Free",
    price: 0,
    credits: "10k",
    projects: 3,
    current: false,
    popular: false,
    features: ["10k credits /mo", "3 Studio Projects", "Access to Generate, Library, Stems", "Basic audio quality"],
  },
  {
    id: "starter",
    name: "Starter",
    price: 5,
    credits: "30k",
    projects: 20,
    current: false,
    popular: false,
    features: ["30k credits /mo", "20 Studio Projects", "Album Composer access", "Commercial License", "High quality audio"],
  },
  {
    id: "creator",
    name: "Creator",
    price: 15,
    credits: "121k",
    projects: 1000,
    current: false,
    popular: true,
    features: ["121k credits /mo", "1,000 Studio Projects", "Professional stems", "192kbps quality audio", "Everything in Starter"],
  },
  {
    id: "pro",
    name: "Pro",
    price: 35,
    credits: "600k",
    projects: 3000,
    current: true,
    popular: false,
    features: ["600k credits /mo", "3,000 Studio Projects", "44.1kHz PCM audio output", "API access", "Everything in Creator"],
  },
] as const;

export const STEMS = ["Vocals", "Instrumental", "Bass", "Drums", "Other"] as const;

export const TYPE_COLORS: Record<string, string> = {
  Music: "var(--aw-accent)",
  Song: "var(--aw-green)",
  "Sound FX": "var(--aw-purple)",
};

export const THUMB_GRADIENTS = [
  "linear-gradient(135deg,#c8702a,#7b3fa0)",
  "linear-gradient(135deg,#2a6ec8,#20a06a)",
  "linear-gradient(135deg,#a02a5a,#c87820)",
  "linear-gradient(135deg,#206090,#60a040)",
  "linear-gradient(135deg,#7030c0,#3060c0)",
  "linear-gradient(135deg,#c04040,#804090)",
  "linear-gradient(135deg,#205060,#40a080)",
  "linear-gradient(135deg,#805020,#206040)",
  "linear-gradient(135deg,#602080,#c07030)",
] as const;

export const ENERGY_PREFERENCES = [
  "high_energy", "climax", "drop", "chorus", "verse", "build", "chill", "outro", "intro_heavy"
] as const;

export const CROSSFADE_BEATS = [
  { value: 0.5, label: "Half beat" },
  { value: 1.0, label: "1 beat" },
  { value: 2.0, label: "2 beats" },
  { value: 4.0, label: "1 bar" }
] as const;

export const STRICTNESS_LEVELS = [
  { value: 0.0, label: "Musical" },
  { value: 0.5, label: "Balanced" },
  { value: 1.0, label: "Precise" }
] as const;

export const SEGMENT_LABELS = [
  "intro", "verse", "build", "chorus", "peak", "drop", "bridge", "outro"
] as const;

export const SEGMENT_COLORS: Record<string, string> = {
  intro: "var(--aw-purple, #a070e0)",
  verse: "var(--aw-blue, #6090e0)",
  build: "var(--aw-accent, #e8a055)",
  chorus: "var(--aw-green, #60c090)",
  peak: "var(--aw-red, #e06060)",
  drop: "var(--aw-red, #e06060)",
  bridge: "var(--aw-accent-dim, rgba(232,160,85,0.18))",
  outro: "var(--aw-text-3, #505050)",
};
