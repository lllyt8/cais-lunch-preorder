export const MENU_CATEGORIES = [
  {
    id: "rice",
    emoji: "🍚",
    nameCn: "饭类",
    nameEn: "Rice / Bento",
    description: "所有含米饭的主餐",
  },
  {
    id: "noodles",
    emoji: "🍜",
    nameCn: "面类",
    nameEn: "Noodles",
    description: "所有汤面/干面",
  },
  {
    id: "dumplings",
    emoji: "🥟",
    nameCn: "饺子类",
    nameEn: "Dumplings",
    description: "饺子/云吞",
  },
  {
    id: "snacks",
    emoji: "🍟",
    nameCn: "零食小食",
    nameEn: "Snacks",
    description: "小食和开胃菜",
  },
] as const;

export type CategoryId = "rice" | "noodles" | "dumplings" | "snacks";

export type MenuCategory = (typeof MENU_CATEGORIES)[number];
