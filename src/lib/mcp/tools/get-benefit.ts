import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseAnon } from "../supabase";

export default defineTool({
  name: "get_benefit",
  title: "Get benefit",
  description: "Get full details of one active coupon by slug or id, including discount options, instructions and terms.",
  inputSchema: { slug: z.string().min(1).describe("Benefit slug or id from search_benefits.") },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ slug }) => {
    const isUuid = /^[0-9a-f-]{36}$/i.test(slug);
    const { data, error } = await supabaseAnon()
      .from("benefits")
      .select("id, slug, title, description, discount_badge, discount_tiers, instructions, terms, target_url, expiry_date, brand:brands(name, website_url)")
      .eq(isUuid ? "id" : "slug", slug)
      .gt("expiry_date", new Date().toISOString())
      .maybeSingle();
    if (error) throw new ToolError(error.message);
    if (!data) throw new ToolError("Benefit not found or expired.");
    const brand = data.brand as { name?: string; website_url?: string | null } | null;
    const tiers = Array.isArray(data.discount_tiers)
      ? (data.discount_tiers as Array<Record<string, unknown>>).map((t) => ({
          label: String(t.label ?? ""),
          discount: String(t.discount ?? ""),
        }))
      : [];
    const benefit = {
      id: data.id,
      slug: data.slug ?? data.id,
      title: data.title,
      brand: brand?.name ?? null,
      discount: data.discount_badge,
      options: tiers,
      description: data.description,
      instructions: data.instructions,
      terms: data.terms,
      url: data.target_url,
      expires: data.expiry_date,
    };
    const text = [
      `${benefit.brand ?? ""} — ${benefit.title} (${benefit.discount})`,
      tiers.length ? `Options: ${tiers.map((t) => `${t.label} ${t.discount}`).join(", ")}` : "",
      benefit.description ?? "",
      benefit.instructions ? `How to use: ${benefit.instructions}` : "",
      `Expires: ${benefit.expires}`,
    ].filter(Boolean).join("\n");
    return { content: [{ type: "text", text }], structuredContent: { benefit } };
  },
});
