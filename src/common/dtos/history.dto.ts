import * as z from "zod";

export const HistoryDto = z.object({
  id: z.string().uuid().optional(),
});
