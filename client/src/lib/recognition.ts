import type { PublicPortfolio } from "@/features/portfolio/schema";

export const recognitionCollections = {
  awards: {
    label: "Awards",
    eyebrow: "RECOGNITION",
    title: "Awards",
    description: "Awards and recognition along the way.",
  },
  certifications: {
    label: "Certifications",
    eyebrow: "PROFESSIONAL DEVELOPMENT",
    title: "Certifications",
    description: "Certifications and credentials earned over time.",
  },
  research: {
    label: "Research",
    eyebrow: "PUBLICATIONS",
    title: "Research",
    description: "Research and publications.",
  },
} as const;

export type RecognitionCollection = keyof typeof recognitionCollections;

export type RecognitionEntry = {
  id: string;
  title: string;
  description: string | null;
  source: string | null;
  date: string | null;
  imageUrl: string | null;
  link: string | null;
};

export function getRecognitionEntries(
  portfolio: PublicPortfolio,
  collection: RecognitionCollection,
): RecognitionEntry[] {
  switch (collection) {
    case "awards":
      return portfolio.achievements.map(toAwardEntry);
    case "certifications":
      return portfolio.certifications.map(toCertificationEntry);
    case "research":
      return portfolio.research.map(toResearchEntry);
  }
}

function toAwardEntry(item: PublicPortfolio["achievements"][number]): RecognitionEntry {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    source: item.organization,
    date: item.date,
    imageUrl: item.imageUrl,
    link: item.link,
  };
}

function toCertificationEntry(item: PublicPortfolio["certifications"][number]): RecognitionEntry {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    source: item.issuer,
    date: item.issueDate,
    imageUrl: item.imageUrl,
    link: item.credentialUrl,
  };
}

function toResearchEntry(item: PublicPortfolio["research"][number]): RecognitionEntry {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    source: [item.publication, item.authors].filter(Boolean).join(" · ") || null,
    date: item.publishedAt,
    imageUrl: item.imageUrl,
    link: item.link,
  };
}
