import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { supabaseAnon } from "../supabase";

export default defineTool({
  name: "list_categories",
  title: "List categories",
  description: "List benefit categories in the admin-defined display order.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async () => {
    const { data, error } = await supabaseAnon()
      .from("categories")
      .select("id, name, sort_order")
      .order("sort_order");
    if (error) throw new ToolError(error.message);
    const categories = (data ?? []).map((c) => ({ id: c.id, name: c.name }));
    return {
      content: [{ type: "text", text: categories.map((c) => `${c.id}: ${c.name}`).join("\n") || "No categories." }],
      structuredContent: { categories },
    };
  },
});
