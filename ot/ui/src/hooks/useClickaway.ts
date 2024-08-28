import { RefObject, useEffect } from "react";

export const useClickaway = (
  ref: RefObject<HTMLElement>,
  onCickaway: () => void,
) => {
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onCickaway();
      }
    };

    document.addEventListener("mousedown", handleClick);

    return () => document.removeEventListener("mousedown", handleClick);
  }, [ref, onCickaway]);
};
