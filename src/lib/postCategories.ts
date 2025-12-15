import { PostCategory } from "@/types";

export const postCategoryLabels: Record<PostCategory, string> = {
  free_offer: "Free Offer",
  help_request: "Looking for Help",
  skill_swap: "Skill Swap",
};

export const postCategoryDescriptions: Record<PostCategory, string> = {
  free_offer: "Offer your skills for free to help others",
  help_request: "Request help without needing to offer something in return",
  skill_swap: "Trade your skills for services you need",
};

export const postCategoryIcons: Record<PostCategory, string> = {
  free_offer: "🎁",
  help_request: "🙋",
  skill_swap: "🔄",
};

export const postCategoryColors: Record<PostCategory, { bg: string; text: string; border: string }> = {
  free_offer: { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-700 dark:text-green-400", border: "border-green-300 dark:border-green-700" },
  help_request: { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-400", border: "border-amber-300 dark:border-amber-700" },
  skill_swap: { bg: "bg-primary/10", text: "text-primary", border: "border-primary/30" },
};
