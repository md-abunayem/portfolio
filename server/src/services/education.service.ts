import prisma from "../config/prisma";
import {
  educationCreateSchema,
  educationUpdateSchema,
} from "../validations/education.validation";
import { ApiError } from "../utils/ApiError";

export const listEducation = () =>
  prisma.education.findMany({
    orderBy: [{ startDate: "desc" }, { id: "desc" }],
    take: 100,
  });

export const educationCrudService = {
  createSchema: educationCreateSchema,
  updateSchema: educationUpdateSchema,
  list: (skip: number, take: number) =>
    prisma.education.findMany({
      skip,
      take,
      orderBy: [{ startDate: "desc" }, { id: "desc" }],
    }),
  count: () => prisma.education.count(),
  get: (id: string) => prisma.education.findUnique({ where: { id } }),
  create: (data: typeof educationCreateSchema._output) =>
    prisma.education.create({ data }),
  update: async (id: string, data: typeof educationUpdateSchema._output) => {
    const existing = await prisma.education.findUnique({ where: { id } });
    if (!existing) throw new ApiError(404, "Education record not found.");
    const startDate = data.startDate ?? existing.startDate;
    const endDate =
      data.endDate === undefined ? existing.endDate : data.endDate;
    if (endDate && endDate < startDate) {
      throw new ApiError(400, "End date cannot be earlier than start date.");
    }
    return prisma.education.update({
      where: { id },
      data: { ...data, endDate },
    });
  },
  remove: (id: string) => prisma.education.delete({ where: { id } }),
};
