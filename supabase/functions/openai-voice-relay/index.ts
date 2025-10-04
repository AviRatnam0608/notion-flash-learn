import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  if (upgradeHeader.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket connection", { status: 400 });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);
  
  const openAIApiKey = Deno.env.get("OPENAI_API_KEY");
  if (!openAIApiKey) {
    socket.close(1008, "Server configuration error");
    return response;
  }

  const openAIUrl = "wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01";
  const openAISocket = new WebSocket(openAIUrl, {
    headers: {
      "Authorization": `Bearer ${openAIApiKey}`,
      "OpenAI-Beta": "realtime=v1"
    }
  });

  openAISocket.onopen = () => {
    console.log("Connected to OpenAI Realtime API");
  };

  openAISocket.onerror = (error) => {
    console.error("OpenAI WebSocket error:", error);
    socket.close(1011, "OpenAI connection error");
  };

  openAISocket.onclose = () => {
    console.log("OpenAI WebSocket closed");
    socket.close(1000, "OpenAI connection closed");
  };

  // Forward messages from client to OpenAI
  socket.onmessage = (event) => {
    if (openAISocket.readyState === WebSocket.OPEN) {
      openAISocket.send(event.data);
    }
  };

  // Forward messages from OpenAI to client
  openAISocket.onmessage = (event) => {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(event.data);
    }
  };

  socket.onclose = () => {
    console.log("Client WebSocket closed");
    if (openAISocket.readyState === WebSocket.OPEN) {
      openAISocket.close();
    }
  };

  socket.onerror = (error) => {
    console.error("Client WebSocket error:", error);
    if (openAISocket.readyState === WebSocket.OPEN) {
      openAISocket.close();
    }
  };

  return response;
});
