import { ServiceCategory } from "@/types";

export const categoryLabels: Record<ServiceCategory, string> = {
  home_improvement: "Home Improvement",
  childcare: "Childcare",
  education: "Education & Tutoring",
  gardening: "Gardening",
  cleaning: "Cleaning",
  cooking: "Cooking & Catering",
  pet_care: "Pet Care",
  transportation: "Transportation",
  tech_support: "Tech Support",
  fitness: "Fitness & Wellness",
  beauty: "Beauty & Grooming",
  crafts: "Arts & Crafts",
  music: "Music & Entertainment",
  photography: "Photography & Video",
  other: "Other",
};

export const categoryIcons: Record<ServiceCategory, string> = {
  home_improvement: "🔨",
  childcare: "👶",
  education: "📚",
  gardening: "🌱",
  cleaning: "🧹",
  cooking: "🍳",
  pet_care: "🐕",
  transportation: "🚗",
  tech_support: "💻",
  fitness: "💪",
  beauty: "💅",
  crafts: "🎨",
  music: "🎵",
  photography: "📷",
  other: "✨",
};

export const allCategories = Object.keys(categoryLabels) as ServiceCategory[];
