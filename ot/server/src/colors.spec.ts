import { test, describe, expect } from "vitest";
import { clientColors, colors, roundRobinNextColor } from "./colors";
import { afterEach } from "node:test";

describe("colors", () => {
  describe("roundRobinNextColor", () => {
    afterEach(() => {
      clientColors.clear();
    });

    test("returns the same color if no clients are added", () => {
      let color = roundRobinNextColor();

      expect(color).toBe(colors.red);

      color = roundRobinNextColor();

      expect(color).toBe(colors.red);
    });

    test("returns the next color for each client added", () => {
      let color = roundRobinNextColor();
      clientColors.set("soraya", color);

      expect(color).toBe(colors.red);

      color = roundRobinNextColor();
      clientColors.set("zhen", color);

      expect(color).toBe(colors.blue);

      color = roundRobinNextColor();
      clientColors.set("kiara", color);

      expect(color).toBe(colors.green);
    });
  });
});
