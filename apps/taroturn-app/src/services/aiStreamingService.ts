// src/services/aiStreamingService.ts - Web ReadableStream SSE Client for AI Interpretation

export interface SseEventHandlers {
  onStart?: (data: { requestId: string; model: string }) => void;
  onDelta?: (delta: string) => void;
  onDone?: (data: { totalLatencyMs: number; completionTokens: number }) => void;
  onError?: (err: { code: string; message: string }) => void;
}

export async function fetchTarotStream(
  url: string,
  token: string,
  payload: Record<string, unknown>,
  handlers: SseEventHandlers,
  signal?: AbortSignal
): Promise<void> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      Accept: "text/event-stream"
    },
    body: JSON.stringify(payload),
    signal
  });

  if (!response.ok || !response.body) {
    throw new Error(`HTTP Stream Error: ${response.status} ${response.statusText}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n\n");
    buffer = lines.pop() ?? "";

    for (const rawFrame of lines) {
      if (!rawFrame.trim() || rawFrame.startsWith(":")) continue;

      let eventType = "message";
      let dataStr = "";

      for (const line of rawFrame.split("\n")) {
        if (line.startsWith("event:")) {
          eventType = line.replace("event:", "").trim();
        } else if (line.startsWith("data:")) {
          dataStr = line.replace("data:", "").trim();
        }
      }

      if (!dataStr) continue;
      try {
        const parsed = JSON.parse(dataStr);
        if (eventType === "start") {
          handlers.onStart?.(parsed);
        } else if (eventType === "delta" && parsed.delta) {
          handlers.onDelta?.(parsed.delta);
        } else if (eventType === "done") {
          handlers.onDone?.(parsed);
        } else if (eventType === "error") {
          handlers.onError?.(parsed);
        }
      } catch (e) {
        console.error("[SSE Parse Error]", e);
      }
    }
  }
}
