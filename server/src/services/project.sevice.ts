import prisma from "../config/prisma";
import { asyncHandler } from "../utils/asyncHandler";

interface CreateProjectData {
    title: string;
    slug: string;
    description: string;
    image?: string;
    githubUrl?: string;
    liveUrl?: string;
    featured?: boolean;
    status?: "DRAFT" | "PUBLISHED";
    technologies?: string[];
}

interface UpdateProjectData {
  title?: string;
  slug?: string;
  description?: string;
  image?: string;
  githubUrl?: string;
  liveUrl?: string;
  featured?: boolean;
  status?: "DRAFT" | "PUBLISHED";
  technologies?: string[];
}

export const createProject = async (data: CreateProjectData) => {
    const {technologies = [], ...projectData} = data;

    return prisma.project.create({
        data: {
            ...projectData,
            technologies: {
                create: technologies.map((tech) => ({ name: tech })),
            }
        }
    })
}