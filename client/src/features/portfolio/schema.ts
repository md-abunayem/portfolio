import { z } from "zod";

const technologySchema = z.object({
  id: z.string(),
  name: z.string(),
  projectId: z.string(),
});

export const projectSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  description: z.string(),
  image: z.string().nullable(),
  githubUrl: z.string().nullable(),
  liveUrl: z.string().nullable(),
  featured: z.boolean(),
  technologies: z.array(technologySchema),
});

const profileSchema = z.object({
  name: z.string(),
  headline: z.string().nullable(),
  shortBio: z.string().nullable(),
  about: z.string().nullable(),
  profileImageUrl: z.string().nullable(),
  heroImageUrl: z.string().nullable(),
  resumeUrl: z.string().nullable(),
});

const skillSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),
  level: z.number().nullable(),
  icon: z.string().nullable(),
  imageUrl: z.string().nullable(),
});

const experienceSchema = z.object({
  id: z.string(),
  company: z.string(),
  position: z.string(),
  location: z.string().nullable(),
  description: z.string(),
  startDate: z.string(),
  endDate: z.string().nullable(),
  current: z.boolean(),
  companyLogoUrl: z.string().nullable(),
});

const educationSchema = z.object({
  id: z.string(),
  institution: z.string(),
  degree: z.string(),
  field: z.string().nullable(),
  description: z.string().nullable(),
  startDate: z.string(),
  endDate: z.string().nullable(),
  grade: z.string().nullable(),
  institutionLogoUrl: z.string().nullable(),
});

const achievementSchema = z.object({
  id: z.string(),
  title: z.string(),
  organization: z.string().nullable(),
  description: z.string(),
  date: z.string().nullable(),
  link: z.string().nullable(),
  imageUrl: z.string().nullable(),
});

const researchSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  authors: z.string().nullable(),
  publication: z.string().nullable(),
  link: z.string().nullable(),
  publishedAt: z.string().nullable(),
  imageUrl: z.string().nullable(),
});

const certificationSchema = z.object({
  id: z.string(),
  title: z.string(),
  issuer: z.string().nullable(),
  description: z.string().nullable(),
  issueDate: z.string().nullable(),
  expiryDate: z.string().nullable(),
  credentialId: z.string().nullable(),
  credentialUrl: z.string().nullable(),
  imageUrl: z.string().nullable(),
});

export const publicPortfolioResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    profile: profileSchema,
    projects: z.array(projectSchema),
    skills: z.array(skillSchema),
    experiences: z.array(experienceSchema),
    education: z.array(educationSchema),
    achievements: z.array(achievementSchema),
    research: z.array(researchSchema),
    certifications: z.array(certificationSchema),
  }),
});

export type Project = z.infer<typeof projectSchema>;
export type PublicPortfolio = z.infer<
  typeof publicPortfolioResponseSchema
>["data"];
