import { serve } from "bun";
import frontend from "./frontend/index.html";
import { NTRIPWebSocketHandler } from "./server/ws";
import { uploadHandler } from "./server/uploadHandler";

const server = serve({
  routes: {
    "/": frontend,
    "/upload": uploadHandler
  },

  fetch(req, server) {
    // upgrade the request to a WebSocket
    if (server.upgrade(req)) {
      return; // do not return a Response
    }
    return new Response("Upgrade failed", { status: 500 });
  },

  websocket: new NTRIPWebSocketHandler(),

  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
  tls: {
    cert: Bun.file("cert.pem"),
    key: Bun.file("key.pem"),
  }
});

console.log(`🚀 Server running at ${server.url}`);
