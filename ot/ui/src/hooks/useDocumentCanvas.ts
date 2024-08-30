import {
  ClientDocument,
  ClientSelections,
  Selection,
} from "@lbennett/collab-text-ot-core";
import { useCallback, useEffect, useRef } from "react";
import { useCursor } from "./useCursor";
import { useLines } from "./useLines";

export function useDocumentCanvas({
  initialCanvasWidth,
  cursorPosition,
  document,
  select,
  isDragging,
  hasFocus,
  content,
  cursorPositions,
}: {
  initialCanvasWidth: number;
  cursorPosition: Selection | null;
  document: ClientDocument | null;
  select: (start: number, end: number) => void;
  isDragging: boolean;
  hasFocus: boolean;
  content: string;
  cursorPositions: ClientSelections | null;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const scale = window.devicePixelRatio ?? 1;

  const maxWidth = initialCanvasWidth;
  const textSize = 30 / scale;
  const lineHeight = textSize;

  const lines = useLines({
    canvasRef,
    content,
    maxWidth,
    scale,
  });

  const { renderSelection, updateCursorPosition, updateSelection } = useCursor({
    maxWidth,
    cursorPosition,
    canvasRef,
    select,
    isDragging,
    hasFocus,
    content,
    lines,
    scale,
    lineHeight,
    textSize,
  });

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

    for (let i = 0; i < lines.length; i++) {
      context.fillText(
        lines[i] + (i < lines.length ? " " : ""),
        0,
        textSize + i * lineHeight,
      );
    }

    for (const position of Object.values(cursorPositions ?? {})) {
      renderSelection(position);
    }
  }, [
    renderSelection,
    document,
    cursorPositions,
    lines,
    lineHeight,
    textSize,
    scale,
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

  return {
    canvasRef,
    maxWidth,
    updateCursorPosition,
    updateSelection,
  };
}
