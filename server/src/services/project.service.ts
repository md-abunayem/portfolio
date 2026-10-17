import prisma from "../config/prisma";
import { ApiError } from "../utils/ApiError";
import {
  projectCreateSchema,
  projectListQuerySchema,
  projectSlugSchema,
  projectUpdateSchema,
} from "../validations/project.validation";

export const listPublishedProjects = async (query: unknown) => {
  const { page, limit, search, featured, technology } =
    projectListQuerySchema.parse(query);
  const where = {
    status: "PUBLISHED" as const,
    ...(featured === undefined ? {} : { featured }),
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: "insensitive" as const } },
            { description: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(technology
      ? {
          technologies: {
            some: { name: { contains: technology, mode: "insensitive" as const } },
          },
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.project.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }, { id: "desc" }],
      include: { technologies: { orderBy: { name: "asc" } } },
    }),
    prisma.project.count({ where }),
  ]);

  return { items, page, limit, total, totalPages: Math.ceil(total / limit) };
};

export const listFeaturedProjects = () =>
  prisma.project.findMany({
    where: { status: "PUBLISHED", featured: true },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: 100,
    include: { technologies: { orderBy: { name: "asc" } } },
  });

export const listAllPublishedProjects = () =>
  prisma.project.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }, { id: "desc" }],
    take: 100,
    include: { technologies: { orderBy: { name: "asc" } } },
  });

export const getPublishedProject = async (slugInput: unknown) => {
  const slug = projectSlugSchema.parse(slugInput);
  const project = await prisma.project.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: { technologies: { orderBy: { name: "asc" } } },
  });
  if (!project) {
    throw new ApiError(404, "Project not found.");
  }
  return project;
};

const projectRecord = {
  technologies: { orderBy: { name: "asc" as const } },
};

export const adminProjectCrudService = {
  createSchema: projectCreateSchema,
  updateSchema: projectUpdateSchema,
  list: (skip: number, take: number) =>
    prisma.project.findMany({
      skip,
      take,
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }, { id: "desc" }],
      include: projectRecord,
    }),
  count: () => prisma.project.count(),
  get: (id: string) =>
    prisma.project.findUnique({ where: { id }, include: projectRecord }),
  create: (data: typeof projectCreateSchema._output) => {
    const { technologies, ...project } = data;
    return prisma.project.create({
      data: {
        ...project,
        technologies: { create: technologies.map((name) => ({ name })) },
      },
      include: projectRecord,
    });
  },
  update: (id: string, data: typeof projectUpdateSchema._output) => {
    const { technologies, ...project } = data;
    return prisma.project.update({
      where: { id },
      data: {
        ...project,
        ...(technologies === undefined
          ? {}
          : {
              technologies: {
                deleteMany: {},
                create: technologies.map((name) => ({ name })),
              },
            }),
      },
      include: projectRecord,
    });
  },
  remove: (id: string) => prisma.project.delete({ where: { id } }),
};
