import { defineMcp } from "@lovable.dev/mcp-js";
import listCategories from "./tools/list-categories";
import searchBenefits from "./tools/search-benefits";
import getBenefit from "./tools/get-benefit";

export default defineMcp({
  name: "benefit-finder",
  title: "Benefit Finder",
  version: "0.1.0",
  instructions:
    "Public, read-only tools for the Downtown Greenville coupon catalog. Use list_categories to browse sections, search_benefits to find active coupons, and get_benefit for details of one coupon.",
  tools: [listCategories, searchBenefits, getBenefit],
});
