import { useEffect, useRef } from "react";

const waitForConnection = (socket: WebSocket) => {
  return new Promise<void>((resolve) => {
    socket.onopen = () => {
      resolve();
    };
  });
};

export function useWebSocket({
  onMessage,
}: {
  onMessage: (event: MessageEvent) => void;
}) {
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (socketRef.current) {
      return;
    }

    const socket = new WebSocket("ws://localhost:4000");
    socketRef.current = socket;

    (async () => {
      await waitForConnection(socket);
      socket.onmessage = onMessage;
    })();

    return () => {
      socketRef.current?.close();
      socketRef.current = null;
    };
  }, [onMessage]);

  return { socketRef };
}
