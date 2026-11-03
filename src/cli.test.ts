import assert from "node:assert/strict";
import test from "node:test";
import { runCli } from "./cli.js";
import { InMemoryTaskStore } from "./store/task-store.js";
import { TaskService } from "./service/task-service.js";

test("CLI creates, lists and removes tasks", async () => {
  const service = new TaskService(new InMemoryTaskStore());
  let output = "";
  let errors = "";
  const stdout = (text: string) => { output = text; };
  const stderr = (text: string) => { errors = text; };

  assert.equal(await runCli(["task", "create", "--title", " Ler "], service, stdout, stderr), 0);
  const task = JSON.parse(output);
  assert.equal(task.title, "Ler");
  assert.equal(await runCli(["task", "list", "open"], service, stdout, stderr), 0);
  assert.equal(JSON.parse(output).length, 1);
  assert.equal(await runCli(["task", "done", "--id", task.id], service, stdout, stderr), 0);
  assert.equal(JSON.parse(output).done, true);
  assert.equal(await runCli(["task", "remove", "--id", task.id], service, stdout, stderr), 0);
  assert.equal(output, `Task ${task.id} removed`);
  assert.equal(errors, "");
});

test("CLI rejects invalid commands and status", async () => {
  const service = new TaskService(new InMemoryTaskStore());
  const stderr = (text: string) => assert.equal(typeof text, "string");
  assert.equal(await runCli(["task", "create", "--title", "  "], service, () => {}, stderr), 1);
  assert.equal(await runCli(["task", "list", "blocked"], service, () => {}, stderr), 1);
  assert.equal(await runCli(["task", "unknown"], service, () => {}, stderr), 1);
});
