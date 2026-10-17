export type ProjectStatus = "DRAFT" | "PUBLISHED";
export type MessageStatus = "UNREAD" | "READ" | "REPLIED";

export type ProjectTechnology = {
  id: string;
  name: string;
  projectId: string;
};

export type Project = {
  id: string;
  title: string;
  slug: string;
  description: string;
  image: string | null;
  imagePublicId: string | null;
  githubUrl: string | null;
  liveUrl: string | null;
  featured: boolean;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
  technologies: ProjectTechnology[];
};

export type Skill = {
  id: string;
  name: string;
  category: string;
  level: number | null;
  icon: string | null;
  imageUrl: string | null;
  imagePublicId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Experience = {
  id: string;
  company: string;
  position: string;
  location: string | null;
  description: string;
  startDate: string;
  endDate: string | null;
  current: boolean;
  companyLogoUrl: string | null;
  companyLogoPublicId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Education = {
  id: string;
  institution: string;
  degree: string;
  field: string | null;
  description: string | null;
  startDate: string;
  endDate: string | null;
  grade: string | null;
  institutionLogoUrl: string | null;
  institutionLogoPublicId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Achievement = {
  id: string;
  title: string;
  organization: string | null;
  description: string;
  date: string | null;
  link: string | null;
  imageUrl: string | null;
  imagePublicId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Research = {
  id: string;
  title: string;
  description: string;
  authors: string | null;
  publication: string | null;
  link: string | null;
  publishedAt: string | null;
  imageUrl: string | null;
  imagePublicId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Certification = {
  id: string;
  title: string;
  issuer: string | null;
  description: string | null;
  issueDate: string | null;
  expiryDate: string | null;
  credentialId: string | null;
  credentialUrl: string | null;
  imageUrl: string | null;
  imagePublicId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PublicProfile = {
  name: string;
  headline: string | null;
  shortBio: string | null;
  about: string | null;
  profileImageUrl: string | null;
  heroImageUrl: string | null;
  resumeUrl: string | null;
};

export type AdminProfile = PublicProfile & {
  id: string;
  profileImagePublicId: string | null;
  heroImagePublicId: string | null;
  updatedAt: string | null;
};

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  status: MessageStatus;
  createdAt: string;
  updatedAt: string;
};

export type AdminUser = {
  id: string;
  name: string;
  email: string;
};

export type UploadedImage = {
  url: string;
  publicId: string;
};

export type PublicPortfolio = {
  profile: PublicProfile;
  projects: Project[];
  skills: Skill[];
  experiences: Experience[];
  education: Education[];
  achievements: Achievement[];
  research: Research[];
  certifications: Certification[];
};
