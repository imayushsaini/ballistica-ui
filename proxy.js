import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

async function handler(req: Request): Promise<Response> {
  const url = req.url;
  const body = await req.text();
  const path = url.substring(url.indexOf(".dev") + 4);
  const method = req.method;
  // Extract IP and port from the "host" header
  const hostHeader = req.headers.get("bs-host");

  // CORS headers
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, bs-host, secret-key",
  };

  // Handle preflight request
  if (method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  if (!hostHeader) {
    return new Response("Host header not found", { status: 400 });
  }
  // Validate the host header for IPv4 and port
  const ipv4PortRegex = /^(\d{1,3}\.){3}\d{1,3}:\d+$/;
  if (!ipv4PortRegex.test(hostHeader)) {
    return new Response("Invalid IP:Port format", { status: 400 });
  }
  const [IP, PORT] = hostHeader.split(":");
  const response = await fetch(`http://${IP}:${PORT}${path}`, {
    method: req.method,
    body: method !== "GET" && method !== "HEAD" ? body : undefined,
    headers: new Headers(req.headers),
  });

  const newHeaders = new Headers(response.headers);
  for (const [key, value] of Object.entries(corsHeaders)) {
    newHeaders.set(key, value);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
}
serve(handler);
