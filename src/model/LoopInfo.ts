import { z } from 'zod';

export const LoopInfoSchema = z.object({
  loopStart: z.number(),
  loopEnd: z.number(),
  sampleRate: z.number(),
});

export type LoopInfo = Readonly<z.infer<typeof LoopInfoSchema>>;
