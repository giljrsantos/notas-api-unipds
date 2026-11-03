import { IncomingMessage, ServerResponse } from "node:http";
import { ZodError } from "zod";
import { TaskNotFoundError } from "../domain/errors.js";
import { createTaskInputSchema, taskStatusSchema } from "../domain/task.js";
import type { TaskService } from "../service/task-service.js";

const MAX_BODY_BYTES = 1024 * 1024;

function json(res: ServerResponse, status: number, value: unknown): void {
  const body = JSON.stringify(value);
  res.writeHead(status, { "content-type": "application/json; charset=utf-8", "content-length": Buffer.byteLength(body) });
  res.end(body);
}

function errorJson(res: ServerResponse, status: number, error: string, message: string): void {
  json(res, status, { error, message });
}

async function readBody(req: IncomingMessage): Promise<string> {
  const chunks: Buffer[] = [];
  let total = 0;
  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    total += buffer.length;
    if (total > MAX_BODY_BYTES) throw new Error("RequestBodyTooLarge");
    chunks.push(buffer);
  }
  return Buffer.concat(chunks).toString("utf8");
}

export function createTaskHttpHandler(service: TaskService) {
  return async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
    try {
      const url = new URL(req.url ?? "/", "http://localhost");
      const method = req.method ?? "GET";
      const tasksPath = url.pathname === "/tasks";
      const doneMatch = /^\/tasks\/([^/]+)\/done$/.exec(url.pathname);
      const deleteMatch = /^\/tasks\/([^/]+)$/.exec(url.pathname);

      if (tasksPath && method === "POST") {
        let payload: unknown;
        try {
          const body = await readBody(req);
          payload = body.trim() ? JSON.parse(body) : undefined;
        } catch (error) {
          if (error instanceof Error && error.message === "RequestBodyTooLarge") throw error;
          throw new ZodError([]);
        }
        const input = createTaskInputSchema.parse(payload);
        const task = await service.create(input);
        json(res, 201, task);
        return;
      }

      if (tasksPath && method === "GET") {
        const statusParam = url.searchParams.get("status") ?? "all";
        const status = taskStatusSchema.parse(statusParam);
        json(res, 200, await service.list(status));
        return;
      }

      if (doneMatch && method === "PATCH") {
        await readBody(req).catch(() => undefined);
        const id = decodeURIComponent(doneMatch[1]);
        json(res, 200, await service.complete(id));
        return;
      }

      if (deleteMatch && method === "DELETE") {
        const id = decodeURIComponent(deleteMatch[1]);
        await service.remove(id);
        res.writeHead(204);
        res.end();
        return;
      }

      if (tasksPath || doneMatch || deleteMatch) {
        const allowed = tasksPath ? (method === "GET" ? "POST, GET" : "GET, POST") : doneMatch ? "PATCH" : "DELETE";
        res.setHeader("allow", allowed);
        errorJson(res, 405, "MethodNotAllowed", "Method not allowed");
        return;
      }

      errorJson(res, 404, "NotFound", "Route not found");
    } catch (error) {
      if (error instanceof ZodError) {
        errorJson(res, 400, "ValidationError", "Invalid input");
      } else if (error instanceof TaskNotFoundError) {
        errorJson(res, 404, "TaskNotFound", error.message);
      } else if (error instanceof Error && error.message === "RequestBodyTooLarge") {
        errorJson(res, 400, "RequestBodyTooLarge", "Request body exceeds 1 MB");
      } else {
        errorJson(res, 500, "InternalServerError", "Internal server error");
      }
    }
  };
}
