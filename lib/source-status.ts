import { z } from "zod";
export const sourceStatusSchema = z.object({
  checked_at: z.string(),
  changed: z.boolean(),
  resource_modified: z.string(),
  snapshot_resource_modified: z.string(),
  scope: z.literal("metadata-only"),
  data_refreshed: z.literal(false),
});
export const catalogSchema = z.object({
  success: z.literal(true),
  result: z.object({
    resources: z.array(
      z.object({
        id: z.string(),
        last_modified: z.string().nullable().optional(),
      }),
    ),
  }),
});
