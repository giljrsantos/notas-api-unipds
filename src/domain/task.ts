import { z } from "zod";

export interface Task {
  id: string;
  title: string;
  done: boolean;
  createdAt: string;
}

export const titleSchema = z.string().transform((title) => title.trim()).pipe(z.string().min(1, "Title is required"));
export const taskStatusSchema = z.enum(["all", "open", "done"]);
export const createTaskInputSchema = z.object({ title: titleSchema }).strict();

export type TaskStatus = z.infer<typeof taskStatusSchema>;
export type CreateTaskInput = z.infer<typeof createTaskInputSchema>;
