import { serve, serveDir } from "./deps.ts";

await serve((req) => {
  return serveDir(req, {
    fsRoot: "./",
  })
}, {
  onListen: ({ hostname, port }) => {
    console.log(`Server is running at ${hostname}:${port}`);
  },
});