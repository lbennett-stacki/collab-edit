import { WebSocketServer } from "ws";
import {
  AcknowledgeMessage,
  AnyMessage,
  DeleteOperationMessage,
  deserializeMessage,
  InsertOperationMessage,
  MessageType,
  PendingOperation,
  ServerDocument,
  SnapshotMessage,
} from "@lbennett/collab-text-ot-core/server";

const document = new ServerDocument(
  "1Hello 2sdsad 3asdasd 4asdasd 5asdasda 6asdasd 7ello 8asdasd 9sdsasd 10asdasd 11asdad 12asd 13asd 14asdasda",
);

(function main() {
  const server = new WebSocketServer({ port: 4000 });

  server.on("connection", function connection(socket) {
    const send = (message: AnyMessage) => {
      socket.send(message.serialize());
    };

    const sendSnapshot = () => {
      const snapshot = new SnapshotMessage(
        document.revision,
        document.snapshot,
      );
      send(snapshot);
    };

    const handlers = {
      [MessageType.InsertOperation]: (message: InsertOperationMessage) => {
        console.log("got insert op");

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
        console.log("got delete op");

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
    };

    const hasHandler = (key: string): key is keyof typeof handlers => {
      return key in handlers;
    };

    socket.on("error", console.error);

    socket.on("message", function message(data) {
      console.log("got message", data.toString());

      const message = deserializeMessage(data.toString());

      if (!hasHandler(message.type)) {
        throw new Error(`No handler for message type ${message.type}`);
      }

      const handler = handlers[message.type];

      type H = typeof handlers;
      type M = Parameters<H["insert" & "delete"]>[0];

      handler(message as M);
    });

    sendSnapshot();
  });

  console.info("WebSocket Server waiting for connections on port 4000");
})();
