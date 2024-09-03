import {
  ClientDocument,
  ClientSelections,
  Operation,
  PendingOperation,
} from "@lbennett/collab-text-ot-core";
import { useCallback, useState } from "react";

export function useDocument({ onConfirm }: { onConfirm: () => void }) {
  const [document, setDocument] = useState<ClientDocument | null>(null);
  const [content, setContent] = useState<string>("");
  const [cursorPositions, setCursorPositions] =
    useState<ClientSelections | null>(null);
  const cursorPosition =
    document === null ? null : (cursorPositions?.[document.id] ?? null);

  const [waitingFor, setWaitingFor] = useState<PendingOperation | null>(null);

  const moveRight = useCallback(() => {
    if (document === null) {
      throw new Error("Document is not initialized");
    }

    document.moveRight();
    setWaitingFor(document.waitingFor);
    setCursorPositions({ ...document.selections });
  }, [document]);

  const moveLeft = useCallback(() => {
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

  const deleteOp = useCallback(() => {
    if (document === null) {
      throw new Error("Document is not initialized");
    }

    if (cursorPosition === null) {
      throw new Error("Cursor position is not initialized");
    }

    const wasRange = cursorPosition.isRange;

    document.delete();

    if (wasRange) {
      document.collapseSelection();
    }

    setWaitingFor(document.waitingFor);
    setContent(document.snapshot);
    setCursorPositions({ ...document.selections });
  }, [document, cursorPosition]);

  const insert = useCallback(
    (value: string) => {
      if (document === null) {
        throw new Error("Document is not initialized");
      }
      if (cursorPosition === null) {
        throw new Error("Cursor position is not initialized");
      }

      const isRange = cursorPosition.isRange;

      if (isRange) {
        deleteOp();
      }

      document.insert(value);

      setWaitingFor(document.waitingFor);
      setContent(document.snapshot);
      setCursorPositions({ ...document.selections });
    },
    [document, cursorPosition, deleteOp],
  );

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
    onConfirm?.();
  }, [document, onConfirm]);

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
    moveRight,
    moveLeft,
    select,
    confirm,
    waitingFor,
  };
}
