export class TaskNotFoundError extends Error {
  constructor(public readonly id: string) {
    super("Task not found");
    this.name = "TaskNotFoundError";
  }
}
