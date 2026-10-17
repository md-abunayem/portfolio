import prisma from "../config/prisma";
import {
  certificationCreateSchema,
  certificationUpdateSchema,
} from "../validations/certification.validation";

const certificationOrder = [
  { issueDate: { sort: "desc" as const, nulls: "last" as const } },
  { createdAt: "desc" as const },
  { id: "desc" as const },
];

export const listCertifications = () =>
  prisma.certification.findMany({ orderBy: certificationOrder, take: 100 });

export const certificationCrudService = {
  createSchema: certificationCreateSchema,
  updateSchema: certificationUpdateSchema,
  list: (skip: number, take: number) =>
    prisma.certification.findMany({
      skip,
      take,
      orderBy: certificationOrder,
    }),
  count: () => prisma.certification.count(),
  get: (id: string) => prisma.certification.findUnique({ where: { id } }),
  create: (data: typeof certificationCreateSchema._output) =>
    prisma.certification.create({ data }),
  update: (id: string, data: typeof certificationUpdateSchema._output) =>
    prisma.certification.update({ where: { id }, data }),
  remove: (id: string) => prisma.certification.delete({ where: { id } }),
};
