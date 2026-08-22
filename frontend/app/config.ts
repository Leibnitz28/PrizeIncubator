export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export function getWsUrl(): string {
  if (process.env.NEXT_PUBLIC_WS_URL) {
    return process.env.NEXT_PUBLIC_WS_URL;
  }
  
  if (typeof window !== "undefined") {
    if (API_BASE.startsWith("https://")) {
      return API_BASE.replace("https://", "wss://") + "/ws/agent-events";
    }
    if (API_BASE.startsWith("http://")) {
      return API_BASE.replace("http://", "ws://") + "/ws/agent-events";
    }
  }

  return "ws://localhost:3001/ws/agent-events";
}
