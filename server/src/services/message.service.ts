import { z } from "zod";
import prisma from "../config/prisma";
import {
  messageCreateSchema,
  messagePageSchema,
  messageStatusSchema,
} from "../validations/message.validation";
import { ApiError } from "../utils/ApiError";

const messageIdSchema = z.string().min(1).max(100);

export const submitContactMessage = (input: unknown) => {
  const data = messageCreateSchema.parse(input);
  return prisma.message.create({ data });
};

export const listMessages = async (query: unknown) => {
  const { page, pageSize, status } = messagePageSchema.parse(query);
  const where = status ? { status } : {};
  const [items, total] = await Promise.all([
    prisma.message.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    }),
    prisma.message.count({ where }),
  ]);
  return { items, page, pageSize, total };
};

export const getMessage = async (idInput: unknown) => {
  const id = messageIdSchema.parse(idInput);
  const message = await prisma.message.findUnique({ where: { id } });
  if (!message) throw new ApiError(404, "Message not found.");
  return message;
};

export const updateMessageStatus = (idInput: unknown, input: unknown) => {
  const id = messageIdSchema.parse(idInput);
  const data = messageStatusSchema.parse(input);
  return prisma.message.update({ where: { id }, data });
};

export const deleteMessage = async (idInput: unknown) => {
  const id = messageIdSchema.parse(idInput);
  await prisma.message.delete({ where: { id } });
};
