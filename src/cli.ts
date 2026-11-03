import { pathToFileURL } from "node:url";
import { ZodError, z } from "zod";
import { TaskNotFoundError } from "./domain/errors.js";
import { taskStatusSchema, titleSchema } from "./domain/task.js";
import { InMemoryTaskStore } from "./store/task-store.js";
import { TaskService } from "./service/task-service.js";

export async function runCli(
  args: string[],
  service: TaskService,
  stdout: (text: string) => void = console.log,
  stderr: (text: string) => void = console.error,
): Promise<number> {
  try {
    const [entity, action, ...rest] = args;
    if (entity !== "task") throw new Error("Usage: task <create|list|done|remove> ...");

    if (action === "create") {
      const title = readFlag(rest, "--title");
      const input = z.object({ title: titleSchema }).parse({ title });
      stdout(JSON.stringify(await service.create(input)));
      return 0;
    }

    if (action === "list") {
      const status = taskStatusSchema.parse(rest[0] ?? "all");
      if (rest.length > 1) throw new Error("Invalid arguments");
      stdout(JSON.stringify(await service.list(status)));
      return 0;
    }

    if (action === "done") {
      const id = readFlag(rest, "--id");
      z.string().trim().min(1).parse(id);
      stdout(JSON.stringify(await service.complete(id)));
      return 0;
    }

    if (action === "remove") {
      const id = readFlag(rest, "--id");
      z.string().trim().min(1).parse(id);
      await service.remove(id);
      stdout(`Task ${id} removed`);
      return 0;
    }

    throw new Error("Usage: task <create|list|done|remove> ...");
  } catch (error) {
    if (error instanceof ZodError) stderr("Invalid input: " + error.issues.map((issue) => issue.message).join(", "));
    else if (error instanceof TaskNotFoundError) stderr(error.message);
    else if (error instanceof Error) stderr(error.message);
    else stderr("Unknown error");
    return 1;
  }
}

function readFlag(args: string[], flag: string): string {
  const index = args.indexOf(flag);
  if (index < 0 || index + 1 >= args.length || args[index + 1].startsWith("--")) throw new Error(`Missing value for ${flag}`);
  if (args.length !== 2) throw new Error("Invalid arguments");
  return args[index + 1];
}

const invokedDirectly = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (invokedDirectly) {
  const service = new TaskService(new InMemoryTaskStore());
  runCli(process.argv.slice(2), service).then((code) => {
    process.exitCode = code;
  });
}
