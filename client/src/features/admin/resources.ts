export type AdminFieldType =
  | "text"
  | "textarea"
  | "url"
  | "date"
  | "number"
  | "checkbox"
  | "select"
  | "tags"
  | "image";

export type AdminField = {
  name: string;
  label: string;
  type: AdminFieldType;
  required?: boolean;
  options?: { label: string; value: string }[];
  publicIdField?: string;
  uploadFolder?: string;
  fullWidth?: boolean;
  helpText?: string;
};

export type AdminResource = {
  key: string;
  apiPath: string;
  title: string;
  singular: string;
  description: string;
  titleField: string;
  secondaryField?: string;
  fields: AdminField[];
};

const projectStatusOptions = [
  { label: "Draft", value: "DRAFT" },
  { label: "Published", value: "PUBLISHED" },
];

export const resources: Record<string, AdminResource> = {
  projects: {
    key: "projects",
    apiPath: "admin/projects",
    title: "Projects",
    singular: "project",
    description: "Manage the projects shown in your portfolio.",
    titleField: "title",
    secondaryField: "description",
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "slug", label: "URL slug", type: "text", required: true },
      { name: "description", label: "Description", type: "textarea", required: true, fullWidth: true },
      {
        name: "image",
        label: "Project image",
        type: "image",
        publicIdField: "imagePublicId",
        uploadFolder: "portfolio/projects",
        fullWidth: true,
      },
      { name: "githubUrl", label: "GitHub URL", type: "url" },
      { name: "liveUrl", label: "Live URL", type: "url" },
      {
        name: "technologies",
        label: "Technologies",
        type: "tags",
        helpText: "Separate technologies with commas.",
        fullWidth: true,
      },
      { name: "status", label: "Status", type: "select", options: projectStatusOptions },
      { name: "featured", label: "Featured project", type: "checkbox" },
    ],
  },
  skills: {
    key: "skills",
    apiPath: "admin/skills",
    title: "Skills",
    singular: "skill",
    description: "Organize your technical toolkit by category.",
    titleField: "name",
    secondaryField: "category",
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "category", label: "Category", type: "text", required: true },
      { name: "level", label: "Proficiency (0-100)", type: "number" },
      { name: "icon", label: "Icon name", type: "text" },
      {
        name: "imageUrl",
        label: "Skill image",
        type: "image",
        publicIdField: "imagePublicId",
        uploadFolder: "portfolio/skills",
        fullWidth: true,
      },
    ],
  },
  experience: {
    key: "experience",
    apiPath: "admin/experiences",
    title: "Experience",
    singular: "experience",
    description: "Add and update your professional experience.",
    titleField: "position",
    secondaryField: "company",
    fields: [
      { name: "company", label: "Company", type: "text", required: true },
      { name: "position", label: "Position", type: "text", required: true },
      { name: "location", label: "Location", type: "text" },
      { name: "description", label: "Description", type: "textarea", required: true, fullWidth: true },
      { name: "startDate", label: "Start date", type: "date", required: true },
      { name: "endDate", label: "End date", type: "date" },
      { name: "current", label: "Current position", type: "checkbox" },
      {
        name: "companyLogoUrl",
        label: "Company logo",
        type: "image",
        publicIdField: "companyLogoPublicId",
        uploadFolder: "portfolio/experience",
        fullWidth: true,
      },
    ],
  },
  education: {
    key: "education",
    apiPath: "admin/education",
    title: "Education",
    singular: "education record",
    description: "Manage your educational background.",
    titleField: "degree",
    secondaryField: "institution",
    fields: [
      { name: "institution", label: "Institution", type: "text", required: true },
      { name: "degree", label: "Degree", type: "text", required: true },
      { name: "field", label: "Field of study", type: "text" },
      { name: "grade", label: "Grade", type: "text" },
      { name: "description", label: "Description", type: "textarea", fullWidth: true },
      { name: "startDate", label: "Start date", type: "date", required: true },
      { name: "endDate", label: "End date", type: "date" },
      {
        name: "institutionLogoUrl",
        label: "Institution logo",
        type: "image",
        publicIdField: "institutionLogoPublicId",
        uploadFolder: "portfolio/education",
        fullWidth: true,
      },
    ],
  },
  certifications: {
    key: "certifications",
    apiPath: "admin/certifications",
    title: "Certifications",
    singular: "certification",
    description: "Keep your professional certifications up to date.",
    titleField: "title",
    secondaryField: "issuer",
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "issuer", label: "Issuer", type: "text" },
      { name: "credentialId", label: "Credential ID", type: "text" },
      { name: "credentialUrl", label: "Credential URL", type: "url" },
      { name: "issueDate", label: "Issue date", type: "date" },
      { name: "expiryDate", label: "Expiry date", type: "date" },
      { name: "description", label: "Description", type: "textarea", fullWidth: true },
      {
        name: "imageUrl",
        label: "Certificate image",
        type: "image",
        publicIdField: "imagePublicId",
        uploadFolder: "portfolio/certifications",
        fullWidth: true,
      },
    ],
  },
  achievements: {
    key: "achievements",
    apiPath: "admin/achievements",
    title: "Achievements",
    singular: "achievement",
    description: "Showcase milestones and recognition.",
    titleField: "title",
    secondaryField: "organization",
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "organization", label: "Organization", type: "text" },
      { name: "date", label: "Date", type: "date" },
      { name: "link", label: "Link", type: "url" },
      { name: "description", label: "Description", type: "textarea", required: true, fullWidth: true },
      {
        name: "imageUrl",
        label: "Achievement image",
        type: "image",
        publicIdField: "imagePublicId",
        uploadFolder: "portfolio/achievements",
        fullWidth: true,
      },
    ],
  },
  research: {
    key: "research",
    apiPath: "admin/research",
    title: "Research",
    singular: "research entry",
    description: "Publish research, papers, and publications.",
    titleField: "title",
    secondaryField: "publication",
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "publication", label: "Publication", type: "text" },
      { name: "authors", label: "Authors", type: "text" },
      { name: "publishedAt", label: "Publication date", type: "date" },
      { name: "link", label: "Publication URL", type: "url" },
      { name: "description", label: "Description", type: "textarea", required: true, fullWidth: true },
      {
        name: "imageUrl",
        label: "Cover image",
        type: "image",
        publicIdField: "imagePublicId",
        uploadFolder: "portfolio/research",
        fullWidth: true,
      },
    ],
  },
};

export const profileResource: AdminResource = {
  key: "profile",
  apiPath: "admin/profile",
  title: "Profile",
  singular: "profile",
  description: "Update your public identity and portfolio introduction.",
  titleField: "name",
  secondaryField: "headline",
  fields: [
    { name: "name", label: "Name", type: "text", required: true },
    { name: "headline", label: "Headline", type: "text" },
    { name: "shortBio", label: "Short bio", type: "textarea" },
    { name: "about", label: "About", type: "textarea", fullWidth: true },
    {
      name: "profileImageUrl",
      label: "Profile image",
      type: "image",
      publicIdField: "profileImagePublicId",
      uploadFolder: "portfolio/profile",
    },
    {
      name: "heroImageUrl",
      label: "Hero image",
      type: "image",
      publicIdField: "heroImagePublicId",
      uploadFolder: "portfolio/profile",
    },
    { name: "resumeUrl", label: "Résumé URL", type: "url", fullWidth: true },
  ],
};

export const adminNavigation = [
  { href: "/admin", label: "Dashboard", icon: "dashboard" },
  { href: "/admin/projects", label: "Projects", icon: "projects" },
  { href: "/admin/skills", label: "Skills", icon: "skills" },
  { href: "/admin/experience", label: "Experience", icon: "experience" },
  { href: "/admin/education", label: "Education", icon: "education" },
  { href: "/admin/certifications", label: "Certifications", icon: "certifications" },
  { href: "/admin/achievements", label: "Achievements", icon: "achievements" },
  { href: "/admin/research", label: "Research", icon: "research" },
  { href: "/admin/messages", label: "Messages", icon: "messages" },
  { href: "/admin/profile", label: "Profile", icon: "profile" },
] as const;
