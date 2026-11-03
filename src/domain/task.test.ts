import assert from "node:assert/strict";
import test from "node:test";
import { createTaskInputSchema, taskStatusSchema, titleSchema } from "./task.js";

test("domain schemas normalize titles and validate status", () => {
  assert.equal(titleSchema.parse("  Estudar  "), "Estudar");
  assert.throws(() => titleSchema.parse("   "));
  assert.throws(() => taskStatusSchema.parse("blocked"));
  assert.deepEqual(createTaskInputSchema.parse({ title: " Ler " }), { title: "Ler" });
});
