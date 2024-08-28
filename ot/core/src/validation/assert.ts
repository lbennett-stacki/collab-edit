export const assert = (value: any) => {
  return {
    is: (expected: any) => {
      if (value !== expected) {
        throw new Error(`Expected to equal ${expected}`);
      }
    },
    isString: () => {
      if (typeof value !== "string") {
        throw new Error("Expected a string");
      }
    },
    isNumber: () => {
      if (typeof value !== "number") {
        throw new Error("Expected a number");
      }
      return true;
    },
    isObject: () => {
      if (typeof value !== "object") {
        throw new Error("Expected an object");
      }
    },
    isIn: (array: any[]) => {
      if (!array.includes(value)) {
        throw new Error("Value not in array");
      }
    },
  };
};
