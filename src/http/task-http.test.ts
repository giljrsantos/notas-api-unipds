import assert from "node:assert/strict";
import { createServer, type Server } from "node:http";
import test from "node:test";
import { createTaskHttpHandler } from "./task-http.js";
import { InMemoryTaskStore } from "../store/task-store.js";
import { TaskService } from "../service/task-service.js";

async function withServer(run: (baseUrl: string) => Promise<void>): Promise<void> {
  const service = new TaskService(new InMemoryTaskStore());
  const server: Server = createServer((req, res) => { void createTaskHttpHandler(service)(req, res); });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  assert(address && typeof address !== "string");
  try {
    await run(`http://127.0.0.1:${address.port}`);
  } finally {
    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
}

test("HTTP creates, lists, completes and removes tasks", async () => {
  await withServer(async (baseUrl) => {
    const created = await fetch(`${baseUrl}/tasks`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ title: "  Estudar " }) });
    assert.equal(created.status, 201);
    const task = await created.json() as { id: string; title: string; done: boolean };
    assert.equal(task.title, "Estudar");

    const open = await fetch(`${baseUrl}/tasks?status=open`);
    assert.equal(open.status, 200);
    assert.equal((await open.json() as unknown[]).length, 1);

    const completed = await fetch(`${baseUrl}/tasks/${task.id}/done`, { method: "PATCH" });
    assert.equal(completed.status, 200);
    assert.equal((await completed.json() as { done: boolean }).done, true);

    const invalid = await fetch(`${baseUrl}/tasks?status=blocked`);
    assert.equal(invalid.status, 400);

    const removed = await fetch(`${baseUrl}/tasks/${task.id}`, { method: "DELETE" });
    assert.equal(removed.status, 204);
    assert.equal((await (await fetch(`${baseUrl}/tasks`)).json() as unknown[]).length, 0);
  });
});

test("HTTP rejects invalid JSON and missing tasks", async () => {
  await withServer(async (baseUrl) => {
    const invalid = await fetch(`${baseUrl}/tasks`, { method: "POST", headers: { "content-type": "application/json" }, body: "{" });
    assert.equal(invalid.status, 400);
    const missing = await fetch(`${baseUrl}/tasks/missing/done`, { method: "PATCH" });
    assert.equal(missing.status, 404);
    const route = await fetch(`${baseUrl}/unknown`);
    assert.equal(route.status, 404);
  });
});
