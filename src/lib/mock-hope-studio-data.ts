export interface HopeStudioCard {
  id: string;
  title: string;
  imageUrl: string;
  date?: string;
}

export const HOPE_STUDIO_CARDS: HopeStudioCard[] = [
  {
    id: "welcome",
    title: "WELCOME TO HOPE MUSIC COMMUNITY",
    imageUrl: "https://images.unsplash.com/photo-1501612780327-45045538702b?w=800",
  },
  {
    id: "hope-studio",
    title: "HOPE STUDIO",
    imageUrl: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800",
  },
  {
    id: "jesse-liu",
    title: "JESSE LIU | MUSIC ARTIST & FOUNDER",
    imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800",
  },
  {
    id: "shangri-la",
    title: "SHANGRI-LA — A NEW MUSICAL —",
    imageUrl: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800",
  },
  {
    id: "works",
    title: "WORKS",
    imageUrl: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800",
  },
  {
    id: "schedule",
    title: "PERFORMANCE SCHEDULE",
    imageUrl: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800",
  },
];
