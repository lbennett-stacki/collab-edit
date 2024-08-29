import { useCallback, useEffect, useRef, useState } from "react";
import { useClickaway } from "../hooks/useClickaway";
import { useDocumentSocket } from "../hooks/useDocumentSocket";
import { Selection } from "@lbennett/collab-text-ot-core";

const browserDocument = document;

export function Document() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mockInputRef = useRef<HTMLInputElement | null>(null);

  const [hasFocus, setHasFocus] = useState(false);

  const {
    document,
    insert,
    select,
    deleteOp,
    cursorPosition,
    cursorPositions,
    content,
  } = useDocumentSocket();

  const initialCanvasWidth = 800;

  const scale = window.devicePixelRatio ?? 1;

  const maxWidth = initialCanvasWidth;
  const textSize = 30 / scale;
  const lineHeight = textSize;

  const fillLines = useCallback(
    (context: CanvasRenderingContext2D, text: string) => {
      const lines = [];
      const words = text.split(" ");

      let line = "";
      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + " ";
        const testWidth = context.measureText(testLine).width * scale;

        if (testWidth > maxWidth) {
          lines.push(line);
          line = words[n] + " ";
        } else {
          line = testLine;
        }
      }

      if (line) {
        lines.push(line);
      }

      return lines;
    },
    [maxWidth, scale],
  );

  const render = useCallback(() => {
    if (canvasRef.current === null) {
      throw new Error("Canvas is not defined");
    }

    if (!document) {
      return;
    }

    const context = canvasRef.current.getContext("2d");

    if (!context) {
      throw new Error("Context is not defined");
    }

    const cssWidth = canvasRef.current.clientWidth;
    const cssHeight = canvasRef.current.height;

    canvasRef.current.width = cssWidth;
    canvasRef.current.height = cssHeight;

    context.scale(scale, scale);

    context.font = `${textSize}px Arial`;
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);

    const lines = fillLines(context, content);

    for (let i = 0; i < lines.length; i++) {
      context.fillText(
        lines[i] + (i < lines.length ? " " : ""),
        0,
        textSize + i * lineHeight,
      );
    }

    const renderCursor = (start: number, color: string) => {
      const xTotal = start;
      let lineIndex = 0;

      let totalCharacters = 0;
      let positionOnLine = 0;
      for (let i = 0; i < lines.length; i++) {
        totalCharacters += lines[i].length;
        if (totalCharacters > xTotal) {
          lineIndex = i;
          positionOnLine = xTotal - (totalCharacters - lines[i].length);
          break;
        }
      }

      const line = lines[lineIndex];
      const textBeforeCursor = line.slice(0, positionOnLine);
      const cursorX = context.measureText(textBeforeCursor).width;
      const cursorY = lineIndex * lineHeight;
      context.beginPath();
      context.lineWidth = 2;
      context.moveTo(cursorX, cursorY);
      context.lineTo(cursorX, cursorY + textSize);
      context.strokeStyle = color;
      context.stroke();
      context.closePath();
    };

    if (hasFocus && cursorPosition !== null) {
      renderCursor(cursorPosition.start, cursorPosition.color);
    }

    const positions = cursorPositions
      ? (Object.entries(cursorPositions).filter(
          ([clientId, selection]) => selection && clientId !== document?.id,
        ) as Array<[string, Selection]>)
      : [];

    for (const [, position] of positions) {
      renderCursor(position.start, position.color);
    }
  }, [
    document,
    cursorPosition,
    cursorPositions,
    hasFocus,
    fillLines,
    lineHeight,
    textSize,
    scale,
    content,
  ]);

  useEffect(() => {
    if (!document) {
      return;
    }

    render();

    const canvas = canvasRef.current;

    return () => {
      canvas
        ?.getContext("2d")
        ?.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    };
  }, [render, document]);

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
    [cursorPosition, insert, deleteOp, hasFocus],
  );

  useEffect(() => {
    browserDocument.addEventListener("keydown", handleKeyboard);

    return () => {
      browserDocument.removeEventListener("keydown", handleKeyboard);
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

  const updateCursorPosition = (xInput: number, yInput: number) => {
    const context = canvasRef.current?.getContext("2d");

    const x = xInput - (canvasRef.current?.offsetLeft ?? 0);
    const y = yInput - (canvasRef.current?.offsetTop ?? 0);

    if (!context) {
      return;
    }

    const lines = fillLines(context, content);

    const cursorY = Math.floor(Math.max(y / scale / lineHeight, 0));

    let textWidth = 0;

    const charactersBeforeLine = lines.slice(0, cursorY).join("").length;

    const text = lines[cursorY] ?? "";

    let cursorPosition = charactersBeforeLine;

    for (let j = 0; j < text.length; j++) {
      textWidth += context.measureText(text[j]).width;

      if (textWidth * scale > x) {
        cursorPosition += j;
        break;
      }
    }

    if (x > textWidth && cursorPosition === 0) {
      cursorPosition = content.length;
    }

    select(cursorPosition, cursorPosition);
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "start",
      }}
    >
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
        tabIndex={0}
        ref={canvasRef}
        style={{
          margin: "0 auto",
          border: "1px solid rgba(0,0,0,0.3)",
          padding: "12px",
          width: "100%",
          maxWidth: `${initialCanvasWidth}px`,
          height: "100%",
          boxShadow: "10px 10px 5px rgba(0,0,0,0.1)",
        }}
        onMouseDown={(event) => {
          event.preventDefault();
          focus();
          updateCursorPosition(event.clientX, event.clientY);
        }}
      />
    </div>
  );
}
