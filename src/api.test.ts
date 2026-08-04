// @vitest-environment node
import { describe, it, expect } from "vitest";
import { mapRow } from "./api";

describe("mapRow utility", () => {
  it("converts snake_case keys to camelCase keys for a flat object", () => {
    const input = {
      sales_today: 150,
      user_role: "Manager",
      is_active: true,
      created_at: "2026-08-04",
    };
    const expected = {
      salesToday: 150,
      userRole: "Manager",
      isActive: true,
      createdAt: "2026-08-04",
    };
    expect(mapRow(input)).toEqual(expected);
  });

  it("leaves keys unchanged if they are already in camelCase or have no underscores", () => {
    const input = {
      salesToday: 150,
      role: "Staff",
      username: "john_doe", // value contains underscore, key does not
    };
    const expected = {
      salesToday: 150,
      role: "Staff",
      username: "john_doe",
    };
    expect(mapRow(input)).toEqual(expected);
  });

  it("handles empty objects correctly", () => {
    expect(mapRow({})).toEqual({});
  });

  it("handles mixed types of values (null, undefined, arrays, nested objects)", () => {
    const input = {
      null_val: null,
      undefined_val: undefined,
      array_val: [1, 2, 3],
      nested_obj: {
        inner_snake_key: "not mapped because mapRow is shallow",
      },
    };
    const expected = {
      nullVal: null,
      undefinedVal: undefined,
      arrayVal: [1, 2, 3],
      nestedObj: {
        inner_snake_key: "not mapped because mapRow is shallow",
      },
    };
    expect(mapRow(input)).toEqual(expected);
  });

  it("converts multi-word snake_case keys with multiple underscores", () => {
    const input = {
      this_is_a_very_long_snake_case_key: 123,
    };
    const expected = {
      thisIsAVeryLongSnakeCaseKey: 123,
    };
    expect(mapRow(input)).toEqual(expected);
  });

  it("handles trailing and leading underscores as per snakeToCamel implementation", () => {
    // Leading underscore '_a' -> 'A' (because _[a-z] matches)
    // Trailing underscore '_' -> remains '_' (because no [a-z] follows)
    // Multiple underscores '__' -> remains '_' or similar depending on match
    const input = {
      _private_key: "abc",
      suffix_: "xyz",
      foo___bar: "value",
    };
    const expected = {
      PrivateKey: "abc",
      suffix_: "xyz",
      foo__Bar: "value",
    };
    expect(mapRow(input)).toEqual(expected);
  });
});
