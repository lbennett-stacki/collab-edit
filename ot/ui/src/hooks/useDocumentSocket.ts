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
  SelectOperation,
  SelectOperationMessage,
} from "@lbennett/collab-text-ot-core";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDocument } from "./useDocument";
import { useWebSocket } from "./useWebSocket";

export function useDocumentSocket() {
  const [isPending, setIsPending] = useState(false);

  const onConfirm = useCallback(() => {
    setIsPending(false);
  }, []);

  const {
    create: docCreate,
    document,
    confirm,
    content,
    insert,
    deleteOp,
    merge,
    select,
    moveRight,
    moveLeft,
    cursorPosition,
    cursorPositions,
    waitingFor,
  } = useDocument({
    onConfirm,
  });

  const handlers = useMemo(() => {
    return {
      [MessageType.Snapshot]: (message: SnapshotMessage) => {
        docCreate(
          message.clientId,
          message.color,
          message.revision,
          message.snapshot,
        );
      },
      [MessageType.Acknowledge]: (_message: AcknowledgeMessage) => {
        confirm();
      },
      [MessageType.InsertOperation]: (message: InsertOperationMessage) => {
        merge(message.operation.operation);
      },
      [MessageType.DeleteOperation]: (message: DeleteOperationMessage) => {
        merge(message.operation.operation);
      },
      [MessageType.SelectOperation]: (message: SelectOperationMessage) => {
        merge(message.operation.operation);
      },
    };
  }, [docCreate, confirm, merge]);

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

    if (isPending) {
      return;
    }

    // TODO: refactor
    if (document.waitingFor.operation instanceof InsertOperation) {
      send(new InsertOperationMessage(document.waitingFor));
    } else if (document.waitingFor.operation instanceof DeleteOperation) {
      send(new DeleteOperationMessage(document.waitingFor));
    } else if (document.waitingFor.operation instanceof SelectOperation) {
      send(new SelectOperationMessage(document.waitingFor));
    } else {
      throw new Error("Unknown operation type");
    }
    setIsPending(true);
  }, [isPending, document, send]);

  useEffect(() => {
    if (waitingFor === null) {
      return;
    }

    sendNext();
  }, [waitingFor, sendNext]);

  return {
    document,
    socket,
    send,
    insert,
    deleteOp,
    select,
    content,
    cursorPosition,
    cursorPositions,
    moveRight,
    moveLeft,
  };
}
