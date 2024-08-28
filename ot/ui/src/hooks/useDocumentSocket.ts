import {
  AcknowledgeMessage,
  AnyMessage,
  deserializeMessage,
  InsertOperation,
  InsertOperationMessage,
  DeleteOperationMessage,
  MessageType,
  SnapshotMessage,
  DeleteOperation,
} from "@lbennett/collab-text-ot-core";
import { useCallback, useMemo } from "react";
import { useDocument } from "./useDocument";
import { useWebSocket } from "./useWebSocket";

export function useDocumentSocket() {
  const {
    create: docCreate,
    cursor,
    document,
    confirm: docConfirm,
    content,
    insert: docInsert,
    docDelete,
    merge: docMerge,
  } = useDocument();

  const handlers = useMemo(() => {
    return {
      [MessageType.Snapshot]: (message: SnapshotMessage) => {
        docCreate(message.revision, message.snapshot);
      },
      [MessageType.Acknowledge]: (_message: AcknowledgeMessage) => {
        docConfirm();
      },
      [MessageType.InsertOperation]: (message: InsertOperationMessage) => {
        docMerge(message.operation.operation);
      },
      [MessageType.DeleteOperation]: (message: DeleteOperationMessage) => {
        docMerge(message.operation.operation);
      },
    };
  }, [docCreate, docConfirm, docMerge]);

  const hasHandler = useCallback(
    (key: string): key is keyof typeof handlers => {
      return key in handlers;
    },
    [handlers],
  );

  const onMessage = useCallback(
    (event: MessageEvent<any>) => {
      const message = deserializeMessage(event.data);

      if (!hasHandler(message.type)) {
        throw new Error(`No handler for message type ${message.type}`);
      }

      const handler = handlers[message.type];

      type H = typeof handlers;
      type M = Parameters<H["snapshot" & "acknowledge" & "insert"]>[0];

      handler(message as M);
    },
    [handlers, hasHandler],
  );

  const socket = useWebSocket({
    onMessage,
  });

  const send = useCallback(
    (message: AnyMessage) => {
      if (!socket.socketRef.current) {
        throw new Error("Socket is not initialized");
      }
      socket.socketRef.current.send(message.serialize());
    },
    [socket.socketRef],
  );

  const sendNext = useCallback(() => {
    if (!document) {
      throw new Error("Document is not initialized");
    }

    if (document.waitingFor === null) {
      throw new Error("Document is not waiting for an operation");
    }

    if (document.waitingFor.operation instanceof InsertOperation) {
      send(new InsertOperationMessage(document.waitingFor));
    } else if (document.waitingFor.operation instanceof DeleteOperation) {
      send(new DeleteOperationMessage(document.waitingFor));
    } else {
      throw new Error("Unknown operation type");
    }
  }, [document, send]);

  const insert = useCallback(
    (value: string) => {
      if (document === null) {
        throw new Error("Document is not initialized");
      }

      docInsert(value);

      if (!document.waitingFor) {
        throw new Error(
          "document pending operation did not get set as expected",
        );
      }

      sendNext();
    },
    [document, docInsert, sendNext],
  );

  const deleteOp = useCallback(() => {
    if (document === null) {
      throw new Error("Document is not initialized");
    }

    docDelete();

    if (!document.waitingFor) {
      throw new Error("document pending operation did not get set as expected");
    }

    sendNext();
  }, [docDelete, document, sendNext]);

  return { document, socket, deleteOp, send, insert, cursor, content };
}
