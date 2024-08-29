import { test, describe, expect } from "vitest";
import { ServerDocument } from "../src/server/ServerDocument";

describe("integration", () => {
  test("single insert", () => {
    const serverDoc = new ServerDocument("Hello");
    const sorayaDoc = serverDoc.forkClient("soraya");
    const zhenDoc = serverDoc.forkClient("zhen");

    const targetString = "Hel!lo";

    // 1. Soraya inserts !
    sorayaDoc.insert(3, "!");
    // 2. Soraya sends op to server
    // 3. Server merges soraya's op, producing a resulting transformed (or not) operation
    const transformedOp = serverDoc.merge(sorayaDoc.waitingFor!);
    // 4. Server sends an acknowledgement for soraya's op
    // 5. Soraya merges the acknowledgement
    sorayaDoc.confirm();
    // 6. Server sends soraya's op to zhen
    // 7. Zhen merges soraya's op
    zhenDoc.merge(transformedOp);

    expect(serverDoc.snapshot).toBe(targetString);
    expect(sorayaDoc.snapshot).toBe(serverDoc.snapshot);
    expect(zhenDoc.snapshot).toBe(serverDoc.snapshot);
  });

  test("single delete", () => {
    const serverDoc = new ServerDocument("Hello");
    const sorayaDoc = serverDoc.forkClient("soraya");
    const zhenDoc = serverDoc.forkClient("zhen");

    const targetString = "Hell";

    // 1. Soraya deletes o
    sorayaDoc.delete(4);
    // 2. Soraya sends op to server
    // 3. Server merges soraya's op, producing a resulting transformed (or not) operation
    const transformedOp = serverDoc.merge(sorayaDoc.waitingFor!);
    // 4. Server sends an acknowledgement for soraya's op
    // 5. Soraya merges the acknowledgement
    sorayaDoc.confirm();
    // 6. Server sends soraya's op to zhen
    // 7. Zhen merges soraya's op
    zhenDoc.merge(transformedOp);

    expect(serverDoc.snapshot).toBe(targetString);
    expect(sorayaDoc.snapshot).toBe(serverDoc.snapshot);
    expect(zhenDoc.snapshot).toBe(serverDoc.snapshot);
  });

  test("sequential inserts", () => {
    const serverDoc = new ServerDocument("Hello");
    const sorayaDoc = serverDoc.forkClient("soraya");
    const zhenDoc = serverDoc.forkClient("zhen");

    const targetString = "He!ll?o";

    // 1. Soraya inserts !
    sorayaDoc.insert(2, "!");
    // 2. Soraya sends op to server
    // 3. Server merges soraya's op, producing a resulting transformed (or not) operation
    const sorayaOpTransformed = serverDoc.merge(sorayaDoc.waitingFor!);
    // 4. Server sends an acknowledgement for soraya's op
    // 5. Soraya confirms the acknowledgement
    sorayaDoc.confirm();
    // 6. Server sends soraya's op to zhen
    // 7. Zhen merges soraya's op

    zhenDoc.merge(sorayaOpTransformed);

    // 8. Zhen inserts !
    zhenDoc.insert(5, "?"); // 5 because zhen sees He!llo and wants He!ll?o
    // 9. Zhen sends op to server
    // 10. Server merges zhen's op, producing a resulting transformed (or not) operation
    const zhenOpTransformed = serverDoc.merge(zhenDoc.waitingFor!);
    // 11. Server sends an acknowledgement for zhens's op
    // 12. Zhen confirms the acknowledgement
    zhenDoc.confirm();
    // 13. Server sends zhen's op to soraya
    // 14. Soraya merges zhen's op
    sorayaDoc.merge(zhenOpTransformed);

    expect(serverDoc.snapshot).toBe(targetString);
    expect(sorayaDoc.snapshot).toBe(serverDoc.snapshot);
    expect(zhenDoc.snapshot).toBe(serverDoc.snapshot);
  });

  test("multiple sequential inserts", () => {
    const serverDoc = new ServerDocument("Hello");
    const zhenDoc = serverDoc.forkClient("zhen");
    const sorayaDoc = serverDoc.forkClient("soraya");

    const targetString = "He!l&%l?o";

    // 1. Soraya inserts !
    sorayaDoc.insert(2, "!");
    // 2. Soraya sends op to server
    // 3. Server merges soraya's op, producing a resulting transformed (or not) operation
    const sorayaOpTransformed = serverDoc.merge(sorayaDoc.waitingFor!);
    // 4. Server sends an acknowledgement for soraya's op
    // 5. Soraya confirms the acknowledgement
    sorayaDoc.confirm();
    // 6. Server sends soraya's op to zhen
    // 7. Zhen merges soraya's op
    zhenDoc.merge(sorayaOpTransformed);

    // 8. Zhen inserts !
    zhenDoc.insert(5, "?"); // 5 because zhen sees He!llo and wants He!ll?o
    // 9. Zhen sends op to server
    // 10. Server merges zhen's op, producing a resulting transformed (or not) operation
    const zhenOpTransformed = serverDoc.merge(zhenDoc.waitingFor!);
    // 11. Server sends an acknowledgement for zhens's op
    // 12. Zhen confirms the acknowledgement
    zhenDoc.confirm();
    // 13. Server sends zhen's op to soraya
    // 14. Soraya merges zhen's op
    sorayaDoc.merge(zhenOpTransformed);

    // 15. Soraya inserts %
    sorayaDoc.insert(4, "%"); // 4 because zhen sees He!ll?o and wants He!l%l?o
    // 16. Soraya sends op to server
    // 17. Server merges soraya's op, producing a resulting transformed (or not) operation
    const sorayaOpTwoTransformed = serverDoc.merge(sorayaDoc.waitingFor!);
    // 18. Server sends an acknowledgement for soraya's op
    // 19. Soraya confirms the acknowledgement
    sorayaDoc.confirm();
    // 20. Server sends soraya's op to zhen
    // 21. Zhen merges soraya's op
    zhenDoc.merge(sorayaOpTwoTransformed);

    // 22. Zhen inserts &
    zhenDoc.insert(4, "&"); // 4 because zhen sees He!l%l?o and wants He!l&%l?o
    // 23. Zhen sends op to server
    // 24. Server merges zhen's op, producing a resulting transformed (or not) operation
    const zhenOpTwoTransformed = serverDoc.merge(zhenDoc.waitingFor!);
    // 25. Server sends an acknowledgement for zhens's op
    // 26. Zhen confirms the acknowledgement
    zhenDoc.confirm();
    // 27. Server sends zhen's op to soraya
    // 28. Soraya merges zhen's op
    sorayaDoc.merge(zhenOpTwoTransformed);

    expect(serverDoc.snapshot).toBe(targetString);
    expect(sorayaDoc.snapshot).toBe(serverDoc.snapshot);
    expect(zhenDoc.snapshot).toBe(serverDoc.snapshot);
  });

  test("sequential deletes", () => {
    const serverDoc = new ServerDocument("Hello");
    const sorayaDoc = serverDoc.forkClient("soraya");
    const zhenDoc = serverDoc.forkClient("zhen");

    const targetString = "Hll";

    // 1. Soraya deletes e
    sorayaDoc.delete(1);
    // 2. Soraya sends op to server
    // 3. Server merges soraya's op, producing a resulting transformed (or not) operation
    const sorayaOpTransformed = serverDoc.merge(sorayaDoc.waitingFor!);
    // 4. Server sends an acknowledgement for soraya's op
    // 5. Soraya confirms the acknowledgement
    sorayaDoc.confirm();
    // 6. Server sends soraya's op to zhen
    // 7. Zhen merges soraya's op
    zhenDoc.merge(sorayaOpTransformed);

    // 1. Zhen deletes o
    zhenDoc.delete(3); // 3 because zhen sees Hllo and wants Hll
    // 2. Zhen sends op to server
    // 3. Server merges zhen's op, producing a resulting transformed (or not) operation
    const zhenOpTransformed = serverDoc.merge(zhenDoc.waitingFor!);
    // 4. Server sends an acknowledgement for zhens's op
    // 5. Zhen confirms the acknowledgement
    zhenDoc.confirm();
    // 6. Server sends zhen's op to soraya
    // 7. Soraya merges zhen's op
    sorayaDoc.merge(zhenOpTransformed);

    expect(serverDoc.snapshot).toBe(targetString);
    expect(sorayaDoc.snapshot).toBe(serverDoc.snapshot);
    expect(zhenDoc.snapshot).toBe(serverDoc.snapshot);
  });

  test("concurrent inserts", () => {
    const serverDoc = new ServerDocument("Hello");
    const sorayaDoc = serverDoc.forkClient("soraya");
    const zhenDoc = serverDoc.forkClient("zhen");

    const targetString = "He!ll?o";

    // 1. Soraya inserts ! @ 2
    sorayaDoc.insert(2, "!");
    // 2. Zhen inserts ? @ 4
    zhenDoc.insert(4, "?");

    // 3. Soraya sends op to server
    // 4. Zhen sends op to server

    // 5. "Server merges soraya's op, producing a resulting transformed (or not) operation
    const sorayaOpTransformed = serverDoc.merge(sorayaDoc.waitingFor!);
    // 6. "Server merges zhen's op, producing a resulting transformed (or not) operation
    const zhenOpTransformed = serverDoc.merge(zhenDoc.waitingFor!);

    // 7. Server sends an acknowledgement for soraya's op
    // 8. Soraya confirms the acknowledgement
    sorayaDoc.confirm();
    // 9. Server sends soraya's op to zhen
    // 10. Zhen merges soraya's op
    zhenDoc.merge(sorayaOpTransformed);

    // 11. Server sends an acknowledgement for zhen's op
    // 12. zhen confirms the acknowledgement
    zhenDoc.confirm();
    // 13. Server sends zhen's op to soraya
    // 14. Soraya merges zhen's op
    sorayaDoc.merge(zhenOpTransformed);

    expect(serverDoc.snapshot).toBe(targetString);
    expect(sorayaDoc.snapshot).toBe(serverDoc.snapshot);
    expect(zhenDoc.snapshot).toBe(serverDoc.snapshot);
  });

  test("multiple concurrent inserts", () => {
    const serverDoc = new ServerDocument("Hello");
    const sorayaDoc = serverDoc.forkClient("soraya");
    const zhenDoc = serverDoc.forkClient("zhen");

    const targetString = "He!@ll?$o";

    // 1. soraya inserts !! @ 2
    sorayaDoc.insert(2, "@");
    sorayaDoc.insert(2, "!");

    expect(sorayaDoc.snapshot).toBe("He!@llo");

    // 2. Zhen inserts ?? @ 4
    zhenDoc.insert(4, "$");
    zhenDoc.insert(4, "?");

    expect(zhenDoc.snapshot).toBe("Hell?$o");

    // 3. Soraya sends op to server
    // 4. Zhen sends op to server

    // 5. "Server merges soraya's op, producing a resulting transformed (or not) operation
    const sorayaOpTransformed = serverDoc.merge(sorayaDoc.waitingFor!);

    expect(serverDoc.snapshot).toBe("He@llo");

    // 6. "Server merges zhen's op, producing a resulting transformed (or not) operation
    const zhenOpTransformed = serverDoc.merge(zhenDoc.waitingFor!);

    expect(serverDoc.snapshot).toBe("He@ll$o");

    // 7. Server sends an acknowledgement for soraya's op
    // 8. Soraya confirms the acknowledgement
    sorayaDoc.confirm();

    // 9. Soraya sends next op to server
    const sorayaOpTwoTransformed = serverDoc.merge(sorayaDoc.waitingFor!); // He!!ll?o

    expect(serverDoc.snapshot).toBe("He!@ll$o");

    // 13. Server sends zhen's op to soraya
    // 14. Soraya merges zhen's op
    sorayaDoc.merge(zhenOpTransformed); // He!!ll?o

    expect(sorayaDoc.snapshot).toBe("He!@ll$o");

    // 10. Server sends an acknowledgement for soraya's 2nd op
    // 11. Soraya confirms the acknowledgement
    sorayaDoc.confirm();

    // 16. Server sends soraya's op to zhen
    // 10. Zhen merges soraya's op
    zhenDoc.merge(sorayaOpTransformed); // He!ll??o

    expect(zhenDoc.snapshot).toBe("He@ll?$o");

    // 11. Server sends an acknowledgement for zhen's op
    // 12. Zhen confirms the acknowledgement
    zhenDoc.confirm();

    // 13. Zhen sends next op to server
    const zhenOpTwoTransformed = serverDoc.merge(zhenDoc.waitingFor!);

    expect(serverDoc.snapshot).toBe("He!@ll?$o");

    // 16. Server sends soraya's op to zhen
    // 10. Zhen merges soraya's op
    zhenDoc.merge(sorayaOpTwoTransformed);

    expect(zhenDoc.snapshot).toBe(targetString);

    // 14. Server sends an acknowledgement for zhen's 2nd op
    // 15. Zhen confirms the acknowledgement
    zhenDoc.confirm();

    // 13. Server sends zhen's op to soraya
    // 14. Soraya merges zhen's op
    sorayaDoc.merge(zhenOpTwoTransformed);

    expect(serverDoc.snapshot).toBe(targetString);
    expect(sorayaDoc.snapshot).toBe(serverDoc.snapshot);
    expect(zhenDoc.snapshot).toBe(serverDoc.snapshot);
  });

  test("multiple concurrent inserts inverse", () => {
    const serverDoc = new ServerDocument("Hello");
    const sorayaDoc = serverDoc.forkClient("soraya");
    const zhenDoc = serverDoc.forkClient("zhen");

    const targetString = "He?$ll!@o";

    // 1. soraya inserts !! @ 2
    sorayaDoc.insert(4, "@");
    sorayaDoc.insert(4, "!");

    expect(sorayaDoc.snapshot).toBe("Hell!@o");

    // 2. Zhen inserts ?? @ 4
    zhenDoc.insert(2, "$");
    zhenDoc.insert(2, "?");

    expect(zhenDoc.snapshot).toBe("He?$llo");

    // 3. Soraya sends op to server
    // 4. Zhen sends op to server

    // 5. "Server merges soraya's op, producing a resulting transformed (or not) operation
    const sorayaOpTransformed = serverDoc.merge(sorayaDoc.waitingFor!);

    expect(serverDoc.snapshot).toBe("Hell@o");

    // 6. "Server merges zhen's op, producing a resulting transformed (or not) operation
    const zhenOpTransformed = serverDoc.merge(zhenDoc.waitingFor!);

    expect(serverDoc.snapshot).toBe("He$ll@o");

    // 7. Server sends an acknowledgement for soraya's op
    // 8. Soraya confirms the acknowledgement
    sorayaDoc.confirm();

    // 9. Soraya sends next op to server
    const sorayaOpTwoTransformed = serverDoc.merge(sorayaDoc.waitingFor!); // He!!ll?o

    expect(serverDoc.snapshot).toBe("He$ll!@o");

    // 13. Server sends zhen's op to soraya
    // 14. Soraya merges zhen's op
    sorayaDoc.merge(zhenOpTransformed); // He!!ll?o

    expect(sorayaDoc.snapshot).toBe("He$ll!@o");

    // 10. Server sends an acknowledgement for soraya's 2nd op
    // 11. Soraya confirms the acknowledgement
    sorayaDoc.confirm();

    // 16. Server sends soraya's op to zhen
    // 10. Zhen merges soraya's op
    zhenDoc.merge(sorayaOpTransformed); // He!ll??o

    expect(zhenDoc.snapshot).toBe("He?$ll@o");

    // 11. Server sends an acknowledgement for zhen's op
    // 12. Zhen confirms the acknowledgement
    zhenDoc.confirm();

    // 13. Zhen sends next op to server
    const zhenOpTwoTransformed = serverDoc.merge(zhenDoc.waitingFor!);

    expect(serverDoc.snapshot).toBe("He?$ll!@o");

    // 16. Server sends soraya's op to zhen
    // 10. Zhen merges soraya's op
    zhenDoc.merge(sorayaOpTwoTransformed);

    expect(zhenDoc.snapshot).toBe(targetString);

    // 14. Server sends an acknowledgement for zhen's 2nd op
    // 15. Zhen confirms the acknowledgement
    zhenDoc.confirm();

    // 13. Server sends zhen's op to soraya
    // 14. Soraya merges zhen's op
    sorayaDoc.merge(zhenOpTwoTransformed);

    expect(serverDoc.snapshot).toBe(targetString);
    expect(sorayaDoc.snapshot).toBe(serverDoc.snapshot);
    expect(zhenDoc.snapshot).toBe(serverDoc.snapshot);
  });
});
