import type { Task } from "../domain/task.js";

export interface TaskStore {
  create(task: Task): Promise<void>;
  findAll(): Promise<Task[]>;
  findById(id: string): Promise<Task | undefined>;
  update(task: Task): Promise<void>;
  delete(id: string): Promise<boolean>;
}

export class InMemoryTaskStore implements TaskStore {
  private readonly tasks = new Map<string, Task>();

  async create(task: Task): Promise<void> {
    this.tasks.set(task.id, task);
  }

  async findAll(): Promise<Task[]> {
    return [...this.tasks.values()].map((task) => ({ ...task }));
  }

  async findById(id: string): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    return task ? { ...task } : undefined;
  }

  async update(task: Task): Promise<void> {
    this.tasks.set(task.id, { ...task });
  }

  async delete(id: string): Promise<boolean> {
    return this.tasks.delete(id);
  }
}
