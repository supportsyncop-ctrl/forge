import { describe, expect, it } from "vitest";
import { runForgeAgent } from "./agent";

describe("Forge agent runtime", () => {
  it("returns a usable dry-run response without model credentials", async () => {
    delete process.env.LLM_BASE_URL;
    delete process.env.LLM_API_KEY;
    const result = await runForgeAgent("Plan a launch brief", "Research");
    expect(result.fallback).toBe(true);
    expect(result.text).toContain("Plan a launch brief");
  });
});
