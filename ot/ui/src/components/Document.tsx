import { useCallback, useEffect, useRef, useState } from "react";
import { useClickaway } from "../hooks/useClickaway";
import { useDocumentSocket } from "../hooks/useDocumentSocket";
import { useDocumentCanvas } from "../hooks/useDocumentCanvas";

export function Document() {
  const mockInputRef = useRef<HTMLInputElement | null>(null);

  const [hasFocus, setHasFocus] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const {
    document,
    insert,
    select,
    deleteOp,
    cursorPosition,
    cursorPositions,
    content,
  } = useDocumentSocket();

  // TODO: simplify these arguments that fall through to useCursor
  const { updateCursorPosition, updateSelection, canvasRef } =
    useDocumentCanvas({
      cursorPosition,
      cursorPositions,
      content,
      document,
      select,
      isDragging,
      hasFocus,
    });

  const handleKeyboard = useCallback(
    (event: KeyboardEvent) => {
      event.preventDefault();

      const isBackspace = event.key === "Backspace";

      if (
        cursorPosition === null ||
        (event.key.length > 1 && !isBackspace) || // Ignore keys like "Shift", "Enter", etc, for now.
        !hasFocus
      ) {
        return;
      }

      const context = canvasRef.current?.getContext("2d");

      if (!context) {
        return;
      }

      if (isBackspace) {
        deleteOp();
        return;
      }

      insert(event.key);
    },
    [canvasRef, cursorPosition, insert, deleteOp, hasFocus],
  );

  useEffect(() => {
    window.document.addEventListener("keydown", handleKeyboard);

    return () => {
      window.document.removeEventListener("keydown", handleKeyboard);
    };
  }, [handleKeyboard]);

  const focus = () => {
    setHasFocus(true);
  };

  const blur = () => {
    setHasFocus(false);
  };

  useEffect(() => {
    if (hasFocus) {
      mockInputRef.current?.focus();
    }
  }, [hasFocus]);

  useClickaway(canvasRef, () => {
    blur();
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "start",
      }}
    >
      {/* 
        Mock input to prevent browser extensions from doing strange things with our keyboard events.
        For example, the "Vimium" Chrome extension will take keyboard events as shortcuts whilst a user is typing in the canvas.
      */}

      <input
        type="text"
        ref={mockInputRef}
        style={{
          position: "absolute",
          left: "-100px",
          top: "-100px",
        }}
      />
      <canvas
        data-testid="document-canvas"
        tabIndex={0}
        ref={canvasRef}
        style={{
          border: "1px solid rgba(0,0,0,0.3)",
          padding: "22px",
          margin: "12px auto",
          width: "100%",
          height: "100%",
          maxWidth: "860px",
          boxShadow: "10px 10px 0px rgba(0,0,0,0.1)",
        }}
        onMouseMove={(event) => {
          event.preventDefault();
          updateSelection(event.clientX, event.clientY);
        }}
        onMouseDown={(event) => {
          event.preventDefault();
          focus();
          setIsDragging(true);
          const stopDragging = () => {
            setIsDragging(false);
            window.document.removeEventListener("mouseup", stopDragging);
          };
          window.document.addEventListener("mouseup", stopDragging);
          updateCursorPosition(event.clientX, event.clientY);
        }}
      />

      <p>Pending:</p>
      {document?.waitingFor?.toString()}
      <p>Queue:</p>
      {document?.queue.toString()}
    </div>
  );
}
