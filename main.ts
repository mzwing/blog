import { serve, staticFiles } from "./deps.ts";

const serveFiles = (req: Request) =>
  staticFiles("./")({
    request: req,
    respondWith: (r: Response) => r,
  });

await serve((req) => serveFiles(req), {
  onListen: ({ hostname, port }) => {
    console.log(`Server is running at ${hostname}:${port}`);
  },
});
