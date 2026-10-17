import prisma from "../config/prisma";
import {
  researchCreateSchema,
  researchUpdateSchema,
} from "../validations/research.validation";

export const listResearch = () =>
  prisma.research.findMany({
    orderBy: [
      { publishedAt: { sort: "desc", nulls: "last" } },
      { createdAt: "desc" },
      { id: "desc" },
    ],
    take: 100,
  });

export const researchCrudService = {
  createSchema: researchCreateSchema,
  updateSchema: researchUpdateSchema,
  list: (skip: number, take: number) =>
    prisma.research.findMany({
      skip,
      take,
      orderBy: [
        { publishedAt: { sort: "desc", nulls: "last" } },
        { createdAt: "desc" },
        { id: "desc" },
      ],
    }),
  count: () => prisma.research.count(),
  get: (id: string) => prisma.research.findUnique({ where: { id } }),
  create: (data: typeof researchCreateSchema._output) =>
    prisma.research.create({ data }),
  update: (id: string, data: typeof researchUpdateSchema._output) =>
    prisma.research.update({ where: { id }, data }),
  remove: (id: string) => prisma.research.delete({ where: { id } }),
};
