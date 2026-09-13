import { describe, expect, it } from "vitest";
import { createForgeTask, listForgeTasks, supabaseConfigured } from "./supabase";

describe("Forge workspace persistence", () => {
  it("uses the local fallback when Supabase is not configured", async () => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    delete process.env.SUPABASE_ANON_KEY;

    expect(supabaseConfigured()).toBe(false);
    const task = await createForgeTask({ title: "Test Plan Mode", kind: "plan" });
    expect(task.title).toBe("Test Plan Mode");
    expect(task.status).toBe("queued");
    expect((await listForgeTasks()).some((item) => item.id === task.id)).toBe(true);
  });
});
