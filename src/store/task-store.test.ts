import assert from "node:assert/strict";
import test from "node:test";
import { InMemoryTaskStore } from "./task-store.js";
import type { Task } from "../domain/task.js";

const task = (id: string): Task => ({ id, title: id, done: false, createdAt: new Date().toISOString() });

test("in-memory store preserves and removes tasks", async () => {
  const store = new InMemoryTaskStore();
  await store.create(task("1"));
  await store.create(task("2"));
  assert.deepEqual((await store.findAll()).map((item) => item.id), ["1", "2"]);
  assert.equal((await store.findById("1"))?.title, "1");
  assert.equal(await store.delete("1"), true);
  assert.equal(await store.delete("missing"), false);
});
