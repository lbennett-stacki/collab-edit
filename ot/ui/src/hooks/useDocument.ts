import { ClientDocument, Operation } from "@lbennett/collab-text-ot-core";
import { useCallback, useState } from "react";
import { useCursor } from "./useCursor";

export function useDocument() {
  const [document, setDocument] = useState<ClientDocument | null>(null);

  const cursor = useCursor();
  const { cursorPosition, increment, decrement } = cursor;

  const create = useCallback(
    (revision: number, content: string) => {
      if (document !== null) {
        return;
      }

      setDocument(new ClientDocument(revision, content));
    },
    [document],
  );

  const insert = useCallback(
    (value: string) => {
      if (document === null) {
        throw new Error("Document is not initialized");
      }

      if (cursorPosition === null) {
        throw new Error("Cursor position is not initialized");
      }

      document.insert(cursorPosition, value);
      increment();
    },
    [document, increment, cursorPosition],
  );

  const docDelete = useCallback(() => {
    if (document === null) {
      throw new Error("Document is not initialized");
    }

    if (cursorPosition === null) {
      throw new Error("Cursor position is not initialized");
    }

    document.delete(cursorPosition - 1);
    decrement();
  }, [document, decrement, cursorPosition]);

  const merge = useCallback(
    (operation: Operation) => {
      if (document === null) {
        throw new Error("Document is not initialized");
      }

      document.merge(operation);
      setDocument(document.fork());
    },
    [document],
  );

  const confirm = useCallback(() => {
    if (document === null) {
      throw new Error("Document is not initialized");
    }
    document.confirm();
  }, [document]);

  const content = document?.snapshot ?? "";

  return {
    document,
    content,
    insert,
    docDelete,
    merge,
    create,
    cursor,
    confirm,
  };
}
