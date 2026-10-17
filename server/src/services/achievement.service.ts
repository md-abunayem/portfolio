import prisma from "../config/prisma";
import {
  achievementCreateSchema,
  achievementUpdateSchema,
} from "../validations/achievement.validation";

export const listAchievements = () =>
  prisma.achievement.findMany({
    orderBy: [
      { date: { sort: "desc", nulls: "last" } },
      { createdAt: "desc" },
      { id: "desc" },
    ],
    take: 100,
  });

export const achievementCrudService = {
  createSchema: achievementCreateSchema,
  updateSchema: achievementUpdateSchema,
  list: (skip: number, take: number) =>
    prisma.achievement.findMany({
      skip,
      take,
      orderBy: [
        { date: { sort: "desc", nulls: "last" } },
        { createdAt: "desc" },
        { id: "desc" },
      ],
    }),
  count: () => prisma.achievement.count(),
  get: (id: string) => prisma.achievement.findUnique({ where: { id } }),
  create: (data: typeof achievementCreateSchema._output) =>
    prisma.achievement.create({ data }),
  update: (id: string, data: typeof achievementUpdateSchema._output) =>
    prisma.achievement.update({ where: { id }, data }),
  remove: (id: string) => prisma.achievement.delete({ where: { id } }),
};
