import prisma from "../config/prisma";
import {
  experienceCreateSchema,
  experienceUpdateSchema,
} from "../validations/experience.validation";
import { ApiError } from "../utils/ApiError";

export const listExperiences = () =>
  prisma.experience.findMany({
    orderBy: [{ current: "desc" }, { startDate: "desc" }, { id: "desc" }],
    take: 100,
  });

export const experienceCrudService = {
  createSchema: experienceCreateSchema,
  updateSchema: experienceUpdateSchema,
  list: (skip: number, take: number) =>
    prisma.experience.findMany({
      skip,
      take,
      orderBy: [{ current: "desc" }, { startDate: "desc" }, { id: "desc" }],
    }),
  count: () => prisma.experience.count(),
  get: (id: string) => prisma.experience.findUnique({ where: { id } }),
  create: (data: typeof experienceCreateSchema._output) =>
    prisma.experience.create({ data }),
  update: async (id: string, data: typeof experienceUpdateSchema._output) => {
    const existing = await prisma.experience.findUnique({ where: { id } });
    if (!existing) throw new ApiError(404, "Experience not found.");
    const startDate = data.startDate ?? existing.startDate;
    const current = data.current ?? existing.current;
    const endDate =
      current || data.endDate === undefined
        ? current
          ? null
          : existing.endDate
        : data.endDate;
    if (endDate && endDate < startDate) {
      throw new ApiError(400, "End date cannot be earlier than start date.");
    }
    return prisma.experience.update({
      where: { id },
      data: { ...data, endDate },
    });
  },
  remove: (id: string) => prisma.experience.delete({ where: { id } }),
};
