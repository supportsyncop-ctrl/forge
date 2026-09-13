import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { createForgeTask, listForgeTasks, supabaseConfigured } from "./supabase";
import { z } from "zod";
import { runForgeAgent } from "./agent";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  workspace: router({
    recentTasks: publicProcedure.query(async () => ({
      configured: supabaseConfigured(),
      tasks: await listForgeTasks(),
    })),
    createTask: publicProcedure
      .input(z.object({ title: z.string().min(1).max(500), kind: z.string().max(40).optional() }))
      .mutation(async ({ input }) => createForgeTask(input)),
  }),

  agent: router({
    run: publicProcedure
      .input(z.object({ prompt: z.string().min(1).max(6000), context: z.string().max(80).default("Chat") }))
      .mutation(({ input }) => runForgeAgent(input.prompt, input.context)),
  }),

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
