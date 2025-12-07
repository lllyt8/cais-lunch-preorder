export const DIETARY_TAGS = [
  {
    key: "is_vegetarian" as const,
    label: "Vegetarian",
    labelCn: "素食",
    icon: "🌱",
    color: "text-green-700",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
  },
  {
    key: "contains_soy" as const,
    label: "Soy",
    labelCn: "大豆",
    icon: "🫘",
    color: "text-amber-700",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
  },
  {
    key: "contains_gluten" as const,
    label: "Gluten",
    labelCn: "麸质",
    icon: "🌾",
    color: "text-orange-700",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
  },
  {
    key: "contains_fish" as const,
    label: "Fish",
    labelCn: "鱼类",
    icon: "🐟",
    color: "text-blue-700",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  {
    key: "contains_eggs" as const,
    label: "Eggs",
    labelCn: "鸡蛋",
    icon: "🥚",
    color: "text-yellow-700",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
  },
] as const;

export type DietaryTagKey = (typeof DIETARY_TAGS)[number]["key"];

export type DietaryTag = (typeof DIETARY_TAGS)[number];
