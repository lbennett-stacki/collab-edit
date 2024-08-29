import {
  ClientDocument,
  ClientSelections,
  Operation,
  PendingOperation,
} from "@lbennett/collab-text-ot-core";
import { useCallback, useState } from "react";

export function useDocument() {
  const [document, setDocument] = useState<ClientDocument | null>(null);
  const [content, setContent] = useState<string>("");
  const [cursorPositions, setCursorPositions] =
    useState<ClientSelections | null>(null);
  const cursorPosition =
    document === null ? null : (cursorPositions?.[document.id] ?? null);

  const [waitingFor, setWaitingFor] = useState<PendingOperation | null>(null);

  const increment = useCallback(() => {
    if (document === null) {
      throw new Error("Document is not initialized");
    }

    document.moveRight();
    setWaitingFor(document.waitingFor);
    setCursorPositions({ ...document.selections });
  }, [document]);

  const decrement = useCallback(() => {
    if (document === null) {
      throw new Error("Document is not initialized");
    }

    document.moveLeft();
    setWaitingFor(document.waitingFor);
    setCursorPositions({ ...document.selections });
  }, [document]);

  const create = useCallback(
    (clientId: string, color: string, revision: number, content: string) => {
      if (document !== null) {
        return;
      }

      setDocument(new ClientDocument(clientId, color, revision, content));
      setContent(content);
    },
    [document],
  );

  const insert = useCallback(
    (value: string) => {
      if (document === null) {
        throw new Error("Document is not initialized");
      }

      document.insert(value);
      setWaitingFor(document.waitingFor);
      setContent(document.snapshot);
      setCursorPositions({ ...document.selections });
    },
    [document],
  );

  const deleteOp = useCallback(() => {
    if (document === null) {
      throw new Error("Document is not initialized");
    }

    document.delete();
    setWaitingFor(document.waitingFor);
    decrement();
    setContent(document.snapshot);
  }, [document, decrement]);

  const merge = useCallback(
    (operation: Operation) => {
      if (document === null) {
        throw new Error("Document is not initialized");
      }

      document.merge(operation);
      setWaitingFor(document.waitingFor);
      setContent(document.snapshot);
      setCursorPositions({ ...document.selections });
    },
    [document],
  );

  const confirm = useCallback(() => {
    if (document === null) {
      throw new Error("Document is not initialized");
    }
    document.confirm();
    setWaitingFor(document.waitingFor);
  }, [document]);

  const select = useCallback(
    (start: number, end: number) => {
      if (document === null) {
        throw new Error("Document is not initialized");
      }

      document.select(start, end);
      setWaitingFor(document.waitingFor);
      setCursorPositions({ ...document.selections });
    },
    [document],
  );

  return {
    document,
    content,
    insert,
    deleteOp,
    merge,
    create,
    cursorPositions,
    cursorPosition,
    increment,
    decrement,
    select,
    confirm,
    waitingFor,
  };
}
