import { Logger } from "./Logger";

export class ListLogger extends Logger {
  constructor(
    private counter = 0,
    isSilent?: boolean,
  ) {
    super(isSilent);
  }

  log(...args: any[]) {
    this.counter += 1;
    super.log(`* ${this.counter}. `, ...args);
  }
}
