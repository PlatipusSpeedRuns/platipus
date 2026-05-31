import http from "http";
import { WebSocketServer, type WebSocket } from "ws";
import app from "./app";
import { logger } from "./lib/logger";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error("PORT environment variable is required but was not provided.");
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const server = http.createServer(app);

interface StreamSession {
  broadcaster: WebSocket | null;
  viewers: Set<WebSocket>;
}

const streams = new Map<string, StreamSession>();

const wss = new WebSocketServer({ server, path: "/api/ws/stream" });

wss.on("connection", (ws, req) => {
  const rawUrl = req.url ?? "";
  const url = new URL(rawUrl, "http://localhost");
  const streamKey = url.searchParams.get("key");
  const role = url.searchParams.get("role");

  if (!streamKey) {
    ws.close(1008, "Missing stream key");
    return;
  }

  if (!streams.has(streamKey)) {
    streams.set(streamKey, { broadcaster: null, viewers: new Set() });
  }

  const session = streams.get(streamKey)!;

  function broadcastViewerCount() {
    const msg = JSON.stringify({ type: "viewer_count", count: session.viewers.size });
    if (session.broadcaster && session.broadcaster.readyState === 1) {
      session.broadcaster.send(msg);
    }
    session.viewers.forEach((v) => {
      if (v.readyState === 1) {
        v.send(JSON.stringify({ type: "viewer_count", count: session.viewers.size }));
      }
    });
  }

  if (role === "broadcast") {
    if (session.broadcaster && session.broadcaster.readyState === 1) {
      ws.close(1008, "Stream key already in use");
      return;
    }
    session.broadcaster = ws;
    logger.info({ streamKey }, "Broadcaster connected");

    ws.on("message", (data) => {
      session.viewers.forEach((viewer) => {
        if (viewer.readyState === 1) viewer.send(data);
      });
    });

    ws.on("close", () => {
      session.broadcaster = null;
      session.viewers.forEach((viewer) => {
        if (viewer.readyState === 1) {
          viewer.send(JSON.stringify({ type: "stream_ended" }));
        }
      });
      streams.delete(streamKey);
      logger.info({ streamKey }, "Broadcaster disconnected");
    });

    ws.on("error", (err) => logger.error({ err, streamKey }, "Broadcaster WS error"));
  } else if (role === "view") {
    session.viewers.add(ws);
    logger.info({ streamKey, viewers: session.viewers.size }, "Viewer connected");
    broadcastViewerCount();

    if (!session.broadcaster) {
      ws.send(JSON.stringify({ type: "waiting" }));
    }

    ws.on("close", () => {
      session.viewers.delete(ws);
      broadcastViewerCount();
    });

    ws.on("error", (err) => logger.error({ err, streamKey }, "Viewer WS error"));
  } else {
    ws.close(1008, "Invalid role");
  }
});

server.listen(port, (err?: Error) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }
  logger.info({ port }, "Server listening");
});
