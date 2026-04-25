import { describe, expect, it } from "vitest";

import { DEFAULT_FIELDS, formatValue, getFields, parseFields } from "./helpers";

function t(key, options = {}) {
  if (key === "common.number") {
    return new Intl.NumberFormat("en-US", {
      maximumFractionDigits: options.maximumFractionDigits,
      minimumFractionDigits: options.minimumFractionDigits,
      style: options.style,
      currency: options.currency,
    }).format(options.value ?? 0);
  }

  if (key === "common.duration") {
    return `duration:${options.value ?? 0}`;
  }

  return key;
}

describe("widgets/sub2api/helpers", () => {
  it("parses array and JSON string field definitions", () => {
    expect(parseFields(["today_requests", "rpm"])).toEqual(["today_requests", "rpm"]);
    expect(parseFields('["today_requests","rpm"]')).toEqual(["today_requests", "rpm"]);
  });

  it("returns an empty list for invalid field definitions", () => {
    expect(parseFields("{ nope: true }")).toEqual([]);
    expect(parseFields({ nope: true })).toEqual([]);
  });

  it("falls back to defaults and limits fields to four supported values", () => {
    expect(getFields(undefined)).toEqual(DEFAULT_FIELDS);
    expect(getFields(["today_requests", "today_tokens", "today_actual_cost", "rpm", "tpm"])).toEqual([
      "today_requests",
      "today_tokens",
      "today_actual_cost",
      "rpm",
    ]);
    expect(getFields(["today_requests", "invalid_field"])).toEqual(["today_requests"]);
  });

  it("formats tokens, currency, latency, duration, and counts", () => {
    expect(formatValue(t, "today_tokens", { today_tokens: 25337231 })).toBe("25.34M");
    expect(formatValue(t, "today_actual_cost", { today_actual_cost: 14.1882825 })).toBe("$14.19");
    expect(formatValue(t, "average_duration_ms", { average_duration_ms: 19139.97654180855 })).toBe("19,140 ms");
    expect(formatValue(t, "uptime", { uptime: 16166 })).toBe("duration:16166");
    expect(formatValue(t, "rpm", { rpm: 4 })).toBe("4");
  });
});
