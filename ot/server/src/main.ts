import { WebSocketServer } from "ws";
import { randomUUID } from "crypto";
import {
  AcknowledgeMessage,
  AnyMessage,
  DeleteOperationMessage,
  deserializeMessage,
  InsertOperationMessage,
  MessageType,
  PendingOperation,
  SelectOperationMessage,
  ServerDocument,
  SnapshotMessage,
} from "@lbennett/collab-text-ot-core/server";

const document = new ServerDocument(
  `
Hello world! 
This is a collaborative text document.
Operations (insert, delete, select) are sent to the server via websockets.
The server transforms concurrent operations to handle conflicts, preserving user intention.
Transformed operations are broadcast to all other connected sockets.
Client sockets apply the transformation against their local concurrent operations.
  `.trim(),
);

const clientColors = new Map<string, string>();

const colors = [
  "red",
  "blue",
  "green",
  "purple",
  "orange",
  "yellow",
  "pink",
  "brown",
];

const roundRobinNextColor = () => {
  const clientCount = clientColors.size;
  const colorIndex = clientCount % colors.length;

  return colors[colorIndex];
};

(function main() {
  const server = new WebSocketServer({ port: 4000 });

  server.on("connection", function connection(socket) {
    const clientId = randomUUID();
    clientColors.set(clientId, roundRobinNextColor());

    const send = (message: AnyMessage) => {
      socket.send(message.serialize());
    };

    const sendSnapshot = () => {
      const color = clientColors.get(clientId);
      if (!color) {
        throw new Error(`No color for client ${clientId}`);
      }

      const snapshot = new SnapshotMessage(
        clientId,
        color,
        document.revision,
        document.snapshot,
      );
      send(snapshot);
    };

    const handlers = {
      [MessageType.InsertOperation]: (message: InsertOperationMessage) => {
        const transformed = document.merge(message.operation);

        socket.send(new AcknowledgeMessage().serialize());

        const clients = new Set([...server.clients]);
        clients.delete(socket);
        for (const client of clients) {
          client.send(
            new InsertOperationMessage(
              new PendingOperation(transformed, document.revision),
            ).serialize(),
          );
        }
      },
      [MessageType.DeleteOperation]: (message: DeleteOperationMessage) => {
        const transformed = document.merge(message.operation);

        socket.send(new AcknowledgeMessage().serialize());

        const clients = new Set([...server.clients]);
        clients.delete(socket);
        for (const client of clients) {
          client.send(
            new DeleteOperationMessage(
              new PendingOperation(transformed, document.revision),
            ).serialize(),
          );
        }
      },

      [MessageType.SelectOperation]: (message: SelectOperationMessage) => {
        const transformed = document.merge(message.operation);

        socket.send(new AcknowledgeMessage().serialize());

        const clients = new Set([...server.clients]);
        clients.delete(socket);
        for (const client of clients) {
          client.send(
            new SelectOperationMessage(
              new PendingOperation(transformed, document.revision),
            ).serialize(),
          );
        }
      },
    };

    const hasHandler = (key: string): key is keyof typeof handlers => {
      return key in handlers;
    };

    socket.on("error", console.error);

    socket.on("message", function message(data) {
      const message = deserializeMessage(data.toString());

      if (!hasHandler(message.type)) {
        throw new Error(`No handler for message type ${message.type}`);
      }

      const handler = handlers[message.type];

      type H = typeof handlers;
      type M = Parameters<H["insert" & "delete"]>[0];

      handler(message as M);
    });

    socket.on("close", () => {
      clientColors.delete(clientId);
      socket.close();
    });

    sendSnapshot();
  });

  console.info("WebSocket Server waiting for connections on port 4000");
})();
