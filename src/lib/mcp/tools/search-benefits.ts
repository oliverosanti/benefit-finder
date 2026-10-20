import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseAnon } from "../supabase";

export default defineTool({
  name: "search_benefits",
  title: "Search benefits",
  description: "Search active Downtown Greenville coupons by text (title, brand, description) and optionally by category id.",
  inputSchema: {
    query: z.string().optional().describe("Text to match against title, brand name or description."),
    category_id: z.string().uuid().optional().describe("Category id from list_categories."),
    limit: z.number().int().min(1).max(50).optional().describe("Max results (default 20)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ query, category_id, limit }) => {
    let req = supabaseAnon()
      .from("benefits")
      .select("id, slug, title, description, discount_badge, expiry_date, is_featured, category_id, brand:brands(name)")
      .gt("expiry_date", new Date().toISOString())
      .order("is_featured", { ascending: false });
    if (category_id) req = req.eq("category_id", category_id);
    const { data, error } = await req.limit(200);
    if (error) throw new ToolError(error.message);
    const q = query?.trim().toLowerCase();
    const rows = (data ?? [])
      .filter((b) => {
        if (!q) return true;
        const brand = (b.brand as { name?: string } | null)?.name ?? "";
        return [b.title, brand, b.description ?? ""].some((s) => s.toLowerCase().includes(q));
      })
      .slice(0, limit ?? 20)
      .map((b) => ({
        id: b.id,
        slug: b.slug ?? b.id,
        title: b.title,
        brand: (b.brand as { name?: string } | null)?.name ?? null,
        discount: b.discount_badge,
        featured: b.is_featured,
        expires: b.expiry_date,
      }));
    return {
      content: [{
        type: "text",
        text: rows.length
          ? rows.map((r) => `${r.slug}: ${r.brand ?? ""} — ${r.title} (${r.discount})`).join("\n")
          : "No active benefits match.",
      }],
      structuredContent: { benefits: rows },
    };
  },
});
