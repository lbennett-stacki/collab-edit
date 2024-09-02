import { test, describe, expect } from "vitest";
import { ServerDocument } from "../src/server/ServerDocument";

describe("integration", () => {
  test("single insert", () => {
    const serverDoc = new ServerDocument("Hello");
    const sorayaDoc = serverDoc.forkClient("soraya", "rgb(255, 0, 0)");
    const zhenDoc = serverDoc.forkClient("zhen", "rgb(0, 255, 0, 0)");

    const targetString = "Hel!lo";

    sorayaDoc.select(3);
    sorayaDoc.insert("!");

    let transformedOp = serverDoc.merge(sorayaDoc.waitingFor!);
    sorayaDoc.confirm();
    zhenDoc.merge(transformedOp);

    transformedOp = serverDoc.merge(sorayaDoc.waitingFor!);
    sorayaDoc.confirm();
    zhenDoc.merge(transformedOp);

    expect(serverDoc.snapshot).toBe(targetString);
    expect(sorayaDoc.snapshot).toBe(serverDoc.snapshot);
    expect(zhenDoc.snapshot).toBe(serverDoc.snapshot);
  });

  test("single delete", () => {
    const serverDoc = new ServerDocument("Hello");
    const sorayaDoc = serverDoc.forkClient("soraya", "rgb(255, 0, 0)");
    const zhenDoc = serverDoc.forkClient("zhen", "rgb(0, 255, 0, 0)");

    const targetString = "Hell";

    sorayaDoc.select(5);
    sorayaDoc.delete();

    let transformedOp = serverDoc.merge(sorayaDoc.waitingFor!);
    sorayaDoc.confirm();
    zhenDoc.merge(transformedOp);

    transformedOp = serverDoc.merge(sorayaDoc.waitingFor!);
    sorayaDoc.confirm();
    zhenDoc.merge(transformedOp);

    expect(serverDoc.snapshot).toBe(targetString);
    expect(sorayaDoc.snapshot).toBe(serverDoc.snapshot);
    expect(zhenDoc.snapshot).toBe(serverDoc.snapshot);
  });

  test("sequential inserts", () => {
    const serverDoc = new ServerDocument("Hello");
    const sorayaDoc = serverDoc.forkClient("soraya", "rgb(255, 0, 0)");
    const zhenDoc = serverDoc.forkClient("zhen", "rgb(0, 255, 0, 0)");

    const targetString = "He!ll?o";

    sorayaDoc.select(2);
    sorayaDoc.insert("!");

    let sorayaOpTransformed = serverDoc.merge(sorayaDoc.waitingFor!);
    sorayaDoc.confirm();
    zhenDoc.merge(sorayaOpTransformed);

    sorayaOpTransformed = serverDoc.merge(sorayaDoc.waitingFor!);
    sorayaDoc.confirm();
    zhenDoc.merge(sorayaOpTransformed);

    zhenDoc.select(5);
    zhenDoc.insert("?");

    let zhenOpTransformed = serverDoc.merge(zhenDoc.waitingFor!);
    zhenDoc.confirm();
    sorayaDoc.merge(zhenOpTransformed);

    zhenOpTransformed = serverDoc.merge(zhenDoc.waitingFor!);
    zhenDoc.confirm();
    sorayaDoc.merge(zhenOpTransformed);

    expect(serverDoc.snapshot).toBe(targetString);
    expect(sorayaDoc.snapshot).toBe(serverDoc.snapshot);
    expect(zhenDoc.snapshot).toBe(serverDoc.snapshot);
  });

  test("multiple sequential inserts", () => {
    const serverDoc = new ServerDocument("Hello");
    const sorayaDoc = serverDoc.forkClient("soraya", "rgb(255, 0, 0)");
    const zhenDoc = serverDoc.forkClient("zhen", "rgb(0, 255, 0, 0)");

    const targetString = "He!l&%l?o";

    sorayaDoc.select(2);
    sorayaDoc.insert("!");

    let sorayaOpTransformed = serverDoc.merge(sorayaDoc.waitingFor!);
    sorayaDoc.confirm();
    zhenDoc.merge(sorayaOpTransformed);

    sorayaOpTransformed = serverDoc.merge(sorayaDoc.waitingFor!);
    sorayaDoc.confirm();
    zhenDoc.merge(sorayaOpTransformed);

    zhenDoc.select(5);
    zhenDoc.insert("?");

    let zhenOpTransformed = serverDoc.merge(zhenDoc.waitingFor!);
    zhenDoc.confirm();
    sorayaDoc.merge(zhenOpTransformed);

    zhenOpTransformed = serverDoc.merge(zhenDoc.waitingFor!);
    zhenDoc.confirm();
    sorayaDoc.merge(zhenOpTransformed);

    sorayaDoc.select(4);
    sorayaDoc.insert("%");

    let sorayaOpTwoTransformed = serverDoc.merge(sorayaDoc.waitingFor!);
    sorayaDoc.confirm();
    zhenDoc.merge(sorayaOpTwoTransformed);

    sorayaOpTwoTransformed = serverDoc.merge(sorayaDoc.waitingFor!);
    sorayaDoc.confirm();
    zhenDoc.merge(sorayaOpTwoTransformed);

    zhenDoc.select(4);
    zhenDoc.insert("&");

    let zhenOpTwoTransformed = serverDoc.merge(zhenDoc.waitingFor!);
    zhenDoc.confirm();
    sorayaDoc.merge(zhenOpTwoTransformed);

    zhenOpTwoTransformed = serverDoc.merge(zhenDoc.waitingFor!);
    zhenDoc.confirm();
    sorayaDoc.merge(zhenOpTwoTransformed);

    expect(serverDoc.snapshot).toBe(targetString);
    expect(sorayaDoc.snapshot).toBe(serverDoc.snapshot);
    expect(zhenDoc.snapshot).toBe(serverDoc.snapshot);
  });

  test("sequential deletes", () => {
    const serverDoc = new ServerDocument("Hello");
    const sorayaDoc = serverDoc.forkClient("soraya", "rgb(255, 0, 0)");
    const zhenDoc = serverDoc.forkClient("zhen", "rgb(0, 255, 0, 0)");

    const targetString = "Hll";

    sorayaDoc.select(2);
    sorayaDoc.delete();

    let sorayaOpTransformed = serverDoc.merge(sorayaDoc.waitingFor!);
    sorayaDoc.confirm();
    zhenDoc.merge(sorayaOpTransformed);

    sorayaOpTransformed = serverDoc.merge(sorayaDoc.waitingFor!);
    sorayaDoc.confirm();
    zhenDoc.merge(sorayaOpTransformed);

    zhenDoc.select(4);
    zhenDoc.delete();

    let zhenOpTransformed = serverDoc.merge(zhenDoc.waitingFor!);
    zhenDoc.confirm();
    sorayaDoc.merge(zhenOpTransformed);

    zhenOpTransformed = serverDoc.merge(zhenDoc.waitingFor!);
    zhenDoc.confirm();
    sorayaDoc.merge(zhenOpTransformed);

    expect(serverDoc.snapshot).toBe(targetString);
    expect(sorayaDoc.snapshot).toBe(serverDoc.snapshot);
    expect(zhenDoc.snapshot).toBe(serverDoc.snapshot);
  });

  test("concurrent inserts", () => {
    const startString = "Hello";

    const serverDoc = new ServerDocument(startString);
    const sorayaDoc = serverDoc.forkClient("soraya", "rgb(255, 0, 0)");
    const zhenDoc = serverDoc.forkClient("zhen", "rgb(0, 255, 0, 0)");

    const targetString = "He!ll?o";

    sorayaDoc.select(2);
    zhenDoc.select(4);

    let sorayaOpTransformed = serverDoc.merge(sorayaDoc.waitingFor!);
    let zhenOpTransformed = serverDoc.merge(zhenDoc.waitingFor!);

    sorayaDoc.confirm();
    zhenDoc.merge(sorayaOpTransformed);

    zhenDoc.confirm();
    sorayaDoc.merge(zhenOpTransformed);

    expect(serverDoc.snapshot).toBe(startString);
    expect(sorayaDoc.snapshot).toBe(serverDoc.snapshot);
    expect(zhenDoc.snapshot).toBe(serverDoc.snapshot);

    sorayaDoc.insert("!");
    zhenDoc.insert("?");

    sorayaOpTransformed = serverDoc.merge(sorayaDoc.waitingFor!);
    zhenOpTransformed = serverDoc.merge(zhenDoc.waitingFor!);

    sorayaDoc.confirm();
    zhenDoc.merge(sorayaOpTransformed);

    zhenDoc.confirm();
    sorayaDoc.merge(zhenOpTransformed);

    expect(serverDoc.snapshot).toBe(targetString);
    expect(sorayaDoc.snapshot).toBe(serverDoc.snapshot);
    expect(zhenDoc.snapshot).toBe(serverDoc.snapshot);
  });

  test("multiple concurrent inserts", () => {
    const startString = "Hello";
    const serverDoc = new ServerDocument(startString);
    const sorayaDoc = serverDoc.forkClient("soraya", "rgb(255, 0, 0)");
    const zhenDoc = serverDoc.forkClient("zhen", "rgb(0, 255, 0, 0)");

    const targetString = "He!@ll?$o";

    sorayaDoc.select(2);
    sorayaDoc.insert("@");
    sorayaDoc.select(2);
    sorayaDoc.insert("!");

    const sorayaString = "He!@llo";

    expect(sorayaDoc.snapshot).toBe(sorayaString);

    zhenDoc.select(4);
    zhenDoc.insert("$");
    zhenDoc.select(4);
    zhenDoc.insert("?");

    const zhenString = "Hell?$o";

    expect(zhenDoc.snapshot).toBe(zhenString);

    const sorayaSelectOpTransformed = serverDoc.merge(sorayaDoc.waitingFor!);
    const zhenSelectOpTransformed = serverDoc.merge(zhenDoc.waitingFor!);
    sorayaDoc.merge(zhenSelectOpTransformed);
    zhenDoc.merge(sorayaSelectOpTransformed);
    sorayaDoc.confirm();
    zhenDoc.confirm();

    expect(serverDoc.snapshot).toBe(startString);
    expect(sorayaDoc.snapshot).toBe(sorayaString);
    expect(zhenDoc.snapshot).toBe(zhenString);

    const sorayaInsertOpTransformed = serverDoc.merge(sorayaDoc.waitingFor!);
    expect(serverDoc.snapshot).toBe("He@llo");

    const zhenInsertOpTransformed = serverDoc.merge(zhenDoc.waitingFor!);
    expect(serverDoc.snapshot).toBe("He@ll$o");

    sorayaDoc.confirm();
    sorayaDoc.merge(zhenInsertOpTransformed);
    expect(sorayaDoc.snapshot).toBe("He!@ll$o");

    zhenDoc.merge(sorayaInsertOpTransformed);
    expect(zhenDoc.snapshot).toBe("He@ll?$o");

    zhenDoc.confirm();

    const sorayaSelectOpTwoTransformed = serverDoc.merge(sorayaDoc.waitingFor!);
    const zhenSelectOpTwoTransformed = serverDoc.merge(zhenDoc.waitingFor!);
    sorayaDoc.confirm();
    zhenDoc.merge(sorayaSelectOpTwoTransformed);
    zhenDoc.confirm();
    sorayaDoc.merge(zhenSelectOpTwoTransformed);

    expect(serverDoc.snapshot).toBe("He@ll$o");
    expect(sorayaDoc.snapshot).toBe("He!@ll$o");
    expect(zhenDoc.snapshot).toBe("He@ll?$o");

    const sorayaInsertOpTwoTransformed = serverDoc.merge(sorayaDoc.waitingFor!);
    expect(serverDoc.snapshot).toBe("He!@ll$o");
    const zhenInsertOpTwoTransformed = serverDoc.merge(zhenDoc.waitingFor!);
    expect(serverDoc.snapshot).toBe(targetString);

    sorayaDoc.confirm();
    zhenDoc.merge(sorayaInsertOpTwoTransformed);
    zhenDoc.confirm();
    expect(zhenDoc.snapshot).toBe(targetString);

    sorayaDoc.merge(zhenInsertOpTwoTransformed);
    zhenDoc.confirm();
    expect(sorayaDoc.snapshot).toBe(targetString);
  });

  test("multiple concurrent inserts - inverse", () => {
    const startString = "Hello";
    const serverDoc = new ServerDocument(startString);
    const sorayaDoc = serverDoc.forkClient("soraya", "rgb(255, 0, 0)");
    const zhenDoc = serverDoc.forkClient("zhen", "rgb(0, 255, 0, 0)");

    const targetString = "He?$ll!@o";

    sorayaDoc.select(4);
    sorayaDoc.insert("@");
    sorayaDoc.select(4);
    sorayaDoc.insert("!");

    const sorayaString = "Hell!@o";

    expect(sorayaDoc.snapshot).toBe(sorayaString);

    zhenDoc.select(2);
    zhenDoc.insert("$");
    zhenDoc.select(2);
    zhenDoc.insert("?");

    const zhenString = "He?$llo";

    expect(zhenDoc.snapshot).toBe(zhenString);

    const sorayaSelectOpTransformed = serverDoc.merge(sorayaDoc.waitingFor!);
    const zhenSelectOpTransformed = serverDoc.merge(zhenDoc.waitingFor!);
    sorayaDoc.merge(zhenSelectOpTransformed);
    zhenDoc.merge(sorayaSelectOpTransformed);
    sorayaDoc.confirm();
    zhenDoc.confirm();

    expect(serverDoc.snapshot).toBe(startString);
    expect(sorayaDoc.snapshot).toBe(sorayaString);
    expect(zhenDoc.snapshot).toBe(zhenString);

    const sorayaInsertOpTransformed = serverDoc.merge(sorayaDoc.waitingFor!);
    expect(serverDoc.snapshot).toBe("Hell@o");

    const zhenInsertOpTransformed = serverDoc.merge(zhenDoc.waitingFor!);
    expect(serverDoc.snapshot).toBe("He$ll@o");

    sorayaDoc.confirm();
    sorayaDoc.merge(zhenInsertOpTransformed);
    expect(sorayaDoc.snapshot).toBe("He$ll!@o");

    zhenDoc.merge(sorayaInsertOpTransformed);
    expect(zhenDoc.snapshot).toBe("He?$ll@o");

    zhenDoc.confirm();

    const sorayaSelectOpTwoTransformed = serverDoc.merge(sorayaDoc.waitingFor!);
    const zhenSelectOpTwoTransformed = serverDoc.merge(zhenDoc.waitingFor!);
    sorayaDoc.confirm();
    zhenDoc.merge(sorayaSelectOpTwoTransformed);
    zhenDoc.confirm();
    sorayaDoc.merge(zhenSelectOpTwoTransformed);

    expect(serverDoc.snapshot).toBe("He$ll@o");
    expect(sorayaDoc.snapshot).toBe("He$ll!@o");
    expect(zhenDoc.snapshot).toBe("He?$ll@o");

    const sorayaInsertOpTwoTransformed = serverDoc.merge(sorayaDoc.waitingFor!);
    expect(serverDoc.snapshot).toBe("He$ll!@o");
    const zhenInsertOpTwoTransformed = serverDoc.merge(zhenDoc.waitingFor!);
    expect(serverDoc.snapshot).toBe(targetString);

    sorayaDoc.confirm();
    zhenDoc.merge(sorayaInsertOpTwoTransformed);
    zhenDoc.confirm();
    expect(zhenDoc.snapshot).toBe(targetString);

    sorayaDoc.merge(zhenInsertOpTwoTransformed);
    zhenDoc.confirm();
    expect(sorayaDoc.snapshot).toBe(targetString);
  });
});
