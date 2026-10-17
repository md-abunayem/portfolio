import { z } from "zod";

export interface CrudOperations<CreateInput, UpdateInput, RecordType> {
  createSchema: z.ZodType<CreateInput>;
  updateSchema: z.ZodType<UpdateInput>;
  list: (skip: number, take: number) => Promise<RecordType[]>;
  count: () => Promise<number>;
  get: (id: string) => Promise<RecordType | null>;
  create: (data: CreateInput) => Promise<RecordType>;
  update: (id: string, data: UpdateInput) => Promise<RecordType>;
  remove: (id: string) => Promise<unknown>;
}
