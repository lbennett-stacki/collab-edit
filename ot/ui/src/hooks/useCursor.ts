import { Selection } from "@lbennett/collab-text-ot-core";
import { MutableRefObject, useCallback } from "react";
import { rgbToRgba } from "../utils/colors";

export interface MultilineCharacterPosition {
  line: number;
  character: number;
}

export interface Coords {
  x: number;
  y: number;
}

export type MousePosition = Coords;

export function useCursor({
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
}: {
  maxWidth: number;
  cursorPosition: Selection | null;
  canvasRef: MutableRefObject<HTMLCanvasElement | null>;
  select: (start: number, end: number) => void;
  isDragging: boolean;
  hasFocus: boolean;
  content: string;
  lines: string[];
  scale: number;
  lineHeight: number;
  textSize: number;
}) {
  const calculateSingleLineCharacterPosition = useCallback(
    (xInput: number, yInput: number) => {
      if (!canvasRef.current) {
        throw new Error("Canvas is not defined");
      }

      const context = canvasRef.current.getContext("2d");

      if (!context) {
        throw new Error("Context is not defined");
      }

      const box = canvasRef.current.getBoundingClientRect();

      const x = xInput - box.x;
      const y =
        yInput -
        box.y -
        parseInt(canvasRef.current.style.paddingTop.replace(/px$/, ""), 10);

      if (!context) {
        return null;
      }

      const cursorY = Math.floor(Math.max(y / scale / lineHeight, 0));

      let textWidth = 0;

      const charactersBeforeLine = lines.slice(0, cursorY).join("").length;

      const text = lines[cursorY] ?? "";

      let cursorPosition = charactersBeforeLine;

      for (let j = 0; j < text.length; j++) {
        textWidth += context.measureText(text[j]).width * scale;

        if (textWidth > x) {
          cursorPosition += j;
          break;
        }
      }

      if (x > textWidth && cursorPosition === 0) {
        cursorPosition = content.length;
      }

      return cursorPosition;
    },
    [canvasRef, lineHeight, lines, scale, content.length],
  );

  const updateCursorPosition = useCallback(
    (xInput: number, yInput: number) => {
      const cursorPositionNow = calculateSingleLineCharacterPosition(
        xInput,
        yInput,
      );

      if (!cursorPositionNow) {
        return;
      }

      select(cursorPositionNow, cursorPositionNow);
    },
    [calculateSingleLineCharacterPosition, select],
  );

  const updateSelection = useCallback(
    (xInput: number, yInput: number) => {
      if (!hasFocus || !isDragging) {
        return;
      }

      const context = canvasRef.current?.getContext("2d");

      if (!context) {
        throw new Error("Context is not defined");
      }

      if (!cursorPosition) {
        throw new Error("Cursor position is not defined");
      }

      const cursorPositionNow = calculateSingleLineCharacterPosition(
        xInput,
        yInput,
      );
      if (!cursorPositionNow) {
        return;
      }

      select(cursorPosition.start, cursorPositionNow);
    },
    [
      canvasRef,
      calculateSingleLineCharacterPosition,
      cursorPosition,
      hasFocus,
      isDragging,
      select,
    ],
  );

  const calculateMultilinePosition = useCallback(
    (singleLineCharacterPosition: number): MultilineCharacterPosition => {
      const xTotal = singleLineCharacterPosition;
      let line = 0;

      let totalCharacters = 0;
      let character = 0;
      for (let i = 0; i < lines.length; i++) {
        totalCharacters += lines[i].length;
        if (totalCharacters > xTotal) {
          line = i;
          character = xTotal - (totalCharacters - lines[i].length);
          break;
        }
      }

      return { line, character };
    },
    [lines],
  );

  const renderCursor = useCallback(
    (
      singleLineCharacterPosition: number,
      color: string,
    ): MultilineCharacterPosition & MousePosition => {
      const context = canvasRef.current?.getContext("2d");
      if (!context) {
        throw new Error("No canvas context");
      }
      const multilineCharacterPosition = calculateMultilinePosition(
        singleLineCharacterPosition,
      );
      const { line: lineIndex, character } = multilineCharacterPosition;

      const line = lines[lineIndex];
      const textBeforeCursor = line.slice(0, character);
      const cursorX = context.measureText(textBeforeCursor).width;
      const cursorY = lineIndex * lineHeight;
      context.beginPath();
      context.lineWidth = 2;
      context.moveTo(cursorX, cursorY);
      context.lineTo(cursorX, cursorY + textSize);
      context.strokeStyle = color;
      context.stroke();
      context.closePath();

      return { ...multilineCharacterPosition, x: cursorX, y: cursorY };
    },
    [calculateMultilinePosition, canvasRef, lines, lineHeight, textSize],
  );

  const renderSelectionBridge = useCallback(
    (
      start: MultilineCharacterPosition & MousePosition,
      end: MultilineCharacterPosition & MousePosition,
      color: string,
    ) => {
      const context = canvasRef.current?.getContext("2d");
      if (!context) {
        throw new Error("No canvas context");
      }

      context.fillStyle = rgbToRgba(color, 0.3);

      const [low, high] = start.line <= end.line ? [start, end] : [end, start];

      let lineDiff = high.line - low.line;

      if (lineDiff === 0) {
        // if there is one iteration, it must be one line
        // bridge from cursor start to cursor end
        context.rect(start.x, start.y, end.x - start.x, lineHeight);
        context.fill();
      } else {
        const max = high.line - low.line;
        for (let i = 0; i <= max; i++) {
          if (i === 0) {
            // if first line, from cursor start to end of line
            context.rect(low.x, low.y, maxWidth, lineHeight);
          } else if (i === max) {
            // if last line, from 0 to the cursor position
            context.rect(0, high.y, high.x, lineHeight);
          } else {
            // if middle line, from 0 to end of line
            context.rect(0, low.y + lineHeight * i, maxWidth, lineHeight);
          }
        }
        context.fill();
      }
    },
    [canvasRef, lineHeight, maxWidth],
  );

  const renderPositionIndicator = useCallback(
    (
      selection: Selection,
      start: MultilineCharacterPosition,
      end: MultilineCharacterPosition | null,
      index: number,
    ) => {
      const context = canvasRef.current?.getContext("2d");
      if (!context) {
        throw new Error("No canvas context");
      }

      let text = `${start.line}:${start.character} (${selection.start})`;

      if (end !== null) {
        text += ` to ${end.line}:${end.character} (${selection.end})`;
      }

      context.fillStyle = selection.color;
      context.fillText(
        text,
        maxWidth - context.measureText(text).width,
        textSize * (index + 1),
      );
    },
    [canvasRef, textSize, maxWidth],
  );

  const renderSelection = useCallback(
    (selection: Selection, index: number) => {
      const start = renderCursor(selection.start, selection.color);

      let end = null;
      if (selection.start !== selection.end) {
        end = renderCursor(selection.end, selection.color);
        renderSelectionBridge(start, end, selection.color);
      }

      renderPositionIndicator(selection, start, end, index);
    },
    [renderCursor, renderPositionIndicator, renderSelectionBridge],
  );

  return {
    updateCursorPosition,
    renderSelection,
    updateSelection,
  };
}
