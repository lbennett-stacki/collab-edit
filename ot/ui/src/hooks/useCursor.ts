import { useCallback, useState } from "react";

export function useCursor() {
  const [cursorPosition, setCursorPosition] = useState<number | null>(null);

  const increment = useCallback(() => {
    setCursorPosition((position) => {
      if (position === null) {
        throw new Error("Cursor position is not initialized");
      }

      return position + 1;
    });
  }, []);

  const decrement = useCallback(() => {
    setCursorPosition((position) => {
      if (position === null) {
        throw new Error("Cursor position is not initialized");
      }

      return position - 1;
    });
  }, []);

  return { cursorPosition, setCursorPosition, increment, decrement };
}
