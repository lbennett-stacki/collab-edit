import { ListLogger } from "./ListLogger";

export class StringifyLogger<
  O extends Record<string, unknown>,
> extends ListLogger {
  constructor(counter?: number, isSilent?: boolean) {
    super(counter, isSilent);
  }

  log(nameOrObject: string | O, object?: any) {
    const nameIsString = typeof nameOrObject === "string";

    const entries = Object.entries(
      object ?? (nameIsString ? {} : nameOrObject),
    );

    const stringified = entries.reduce((accum, [key, value]) => {
      accum += `\n${key}:\n${value}\n`;

      return accum;
    }, "");

    const args = [stringified];

    if (nameIsString) {
      args.unshift(`${nameOrObject}\n`);
    }

    super.log(...args);
  }
}
