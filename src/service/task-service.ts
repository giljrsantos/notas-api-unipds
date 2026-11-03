import { randomUUID } from "node:crypto";
import { TaskNotFoundError } from "../domain/errors.js";
import { titleSchema, type CreateTaskInput, type Task, type TaskStatus } from "../domain/task.js";
import type { TaskStore } from "../store/task-store.js";

export class TaskService {
  constructor(private readonly store: TaskStore) {}

  async create(input: CreateTaskInput): Promise<Task> {
    const title = titleSchema.parse(input.title);
    const task: Task = {
      id: randomUUID(),
      title,
      done: false,
      createdAt: new Date().toISOString(),
    };
    await this.store.create(task);
    return { ...task };
  }

  async list(status: TaskStatus = "all"): Promise<Task[]> {
    const tasks = await this.store.findAll();
    if (status === "open") return tasks.filter((task) => !task.done);
    if (status === "done") return tasks.filter((task) => task.done);
    return tasks;
  }

  async complete(id: string): Promise<Task> {
    const task = await this.store.findById(id);
    if (!task) throw new TaskNotFoundError(id);
    if (task.done) return task;

    const completed = { ...task, done: true };
    await this.store.update(completed);
    return completed;
  }

  async remove(id: string): Promise<void> {
    const removed = await this.store.delete(id);
    if (!removed) throw new TaskNotFoundError(id);
  }
}
