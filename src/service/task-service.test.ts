import assert from "node:assert/strict";
import test from "node:test";
import { TaskNotFoundError } from "../domain/errors.js";
import { InMemoryTaskStore } from "../store/task-store.js";
import { TaskService } from "./task-service.js";

test("service creates, lists, completes and removes tasks", async () => {
  const service = new TaskService(new InMemoryTaskStore());
  const open = await service.create({ title: "Estudar" });
  assert.equal(open.done, false);

  const completed = await service.complete(open.id);
  assert.equal(completed.done, true);
  assert.equal((await service.complete(open.id)).done, true);
  assert.equal((await service.list("open")).length, 0);
  assert.equal((await service.list("done")).length, 1);
  assert.equal((await service.list()).length, 1);

  await service.remove(open.id);
  assert.equal((await service.list()).length, 0);
});

test("service returns predictable errors for missing tasks", async () => {
  const service = new TaskService(new InMemoryTaskStore());
  await assert.rejects(() => service.complete("missing"), TaskNotFoundError);
  await assert.rejects(() => service.remove("missing"), TaskNotFoundError);
});
