import { describe, it, expect } from "vitest";
import { getPermittedTabs } from "./tabs";

describe("getPermittedTabs", () => {
  it("should return an empty array if permittedTabIds is empty", () => {
    const permitted = getPermittedTabs([]);
    expect(permitted).toEqual([]);
  });

  it("should filter and return only the permitted tabs", () => {
    const permitted = getPermittedTabs(["Overview", "Waste", "Sell"]);
    expect(permitted).toHaveLength(3);

    // Check IDs
    expect(permitted[0].id).toBe("Overview");
    expect(permitted[1].id).toBe("Waste");
    expect(permitted[2].id).toBe("Sell");

    // Check presence of labels and React node icon elements
    expect(permitted[0].label).toBe("Overview");
    expect(permitted[0].icon).toBeDefined();

    expect(permitted[1].id).toBe("Waste");
    expect(permitted[1].label).toBe("Waste");
    expect(permitted[1].icon).toBeDefined();

    expect(permitted[2].id).toBe("Sell");
    expect(permitted[2].label).toBe("Sales"); // In tabs.tsx, id: "Sell" has label: "Sales"
    expect(permitted[2].icon).toBeDefined();
  });

  it("should ignore IDs that do not exist in the defined tabs", () => {
    const permitted = getPermittedTabs(["NonExistentTab", "Overview", "AnotherFakeTab"]);
    expect(permitted).toHaveLength(1);
    expect(permitted[0].id).toBe("Overview");
  });

  it("should ignore duplicate IDs in permittedTabIds", () => {
    const permitted = getPermittedTabs(["Overview", "Overview", "Solution", "Solution"]);
    expect(permitted).toHaveLength(2);
    expect(permitted[0].id).toBe("Overview");
    expect(permitted[1].id).toBe("Solution");
  });

  it("should handle mixed case or slightly incorrect spelling strictly (strict equality check)", () => {
    const permitted = getPermittedTabs(["overview", "Overview", "SOLUTION"]);
    expect(permitted).toHaveLength(1);
    expect(permitted[0].id).toBe("Overview");
  });
});
