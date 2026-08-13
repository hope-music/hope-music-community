export interface AvatarConfig {
  id: string;
  label: string;
  color: string;
  emoji: string;
}

export const CHARACTER_AVATARS: AvatarConfig[] = [
  { id: "char-1", label: "Violet", color: "#c084fc", emoji: "👧" },
  { id: "char-2", label: "Blue Headphones", color: "#3b82f6", emoji: "🎧" },
  { id: "char-3", label: "Red Bandanna", color: "#dc2626", emoji: "🧑" },
  { id: "char-4", label: "Grey Hair", color: "#9ca3af", emoji: "👨" },
  { id: "char-5", label: "Silver Curly", color: "#e5e5e5", emoji: "👱‍♀️" },
  { id: "char-6", label: "Purple Beanie", color: "#a855f7", emoji: "🧢" },
  { id: "char-7", label: "Green Hat", color: "#22c55e", emoji: "🎓" },
  { id: "char-8", label: "Yellow Theme", color: "#fbbf24", emoji: "☀️" },
  { id: "char-9", label: "Dark Levi", color: "#1e293b", emoji: "🧑‍🦱" },
  { id: "char-10", label: "Orange Kid", color: "#f97316", emoji: "🧒" },
];

export const INSTRUMENT_AVATARS: AvatarConfig[] = [
  { id: "inst-1", label: "Acoustic Guitar", color: "#92400e", emoji: "🎸" },
  { id: "inst-2", label: "Piano Keys", color: "#1e293b", emoji: "🎹" },
  { id: "inst-3", label: "Drum Kit", color: "#ca8a04", emoji: "🥁" },
  { id: "inst-4", label: "Dynamic Microphone", color: "#6b7280", emoji: "🎤" },
];

export const ALL_AVATARS = [...CHARACTER_AVATARS, ...INSTRUMENT_AVATARS];
export const ALL_AVATAR_LABELS = ALL_AVATARS.map(a => a.label);
