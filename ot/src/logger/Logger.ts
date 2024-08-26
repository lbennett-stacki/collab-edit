export class Logger {
  constructor(private isSilent?: boolean) {}

  log(...args: any[]) {
    if (this.isSilent) {
      return;
    }

    console.log(...args);
  }

  silent() {
    this.isSilent = true;
  }
}
