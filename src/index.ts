import { createServer } from "node:http";
import { createTaskHttpHandler } from "./http/task-http.js";
import { TaskService } from "./service/task-service.js";
import { InMemoryTaskStore } from "./store/task-store.js";

const service = new TaskService(new InMemoryTaskStore());
const handler = createTaskHttpHandler(service);
const configuredPort = Number(process.env.PORT);
const port = Number.isInteger(configuredPort) && configuredPort >= 1 && configuredPort <= 65535 ? configuredPort : 3000;

createServer((req, res) => {
  void handler(req, res);
}).listen(port, () => {
  console.log(`Tasks API listening on http://localhost:${port}`);
});
