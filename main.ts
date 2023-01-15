import { serve } from "http/server.ts";
import staticFiles from "static_files";

const serveFiles = (req: Request) => staticFiles("./")({ 
  request: req, 
  respondWith: (r: Response) => r 
})

serve((req) => serveFiles(req), { addr: ':8000' });
