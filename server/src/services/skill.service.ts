import prisma from "../config/prisma";
import { skillCreateSchema, skillUpdateSchema } from "../validations/skill.validation";

export const listSkills = () =>
  prisma.skill.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }, { id: "asc" }],
    take: 100,
  });

export const skillCrudService = {
  createSchema: skillCreateSchema,
  updateSchema: skillUpdateSchema,
  list: (skip: number, take: number) =>
    prisma.skill.findMany({
      skip,
      take,
      orderBy: [{ category: "asc" }, { name: "asc" }, { id: "asc" }],
    }),
  count: () => prisma.skill.count(),
  get: (id: string) => prisma.skill.findUnique({ where: { id } }),
  create: (data: typeof skillCreateSchema._output) =>
    prisma.skill.create({ data }),
  update: (id: string, data: typeof skillUpdateSchema._output) =>
    prisma.skill.update({ where: { id }, data }),
  remove: (id: string) => prisma.skill.delete({ where: { id } }),
};
