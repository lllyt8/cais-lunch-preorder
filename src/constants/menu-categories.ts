import { Utensils, Soup, Cookie, Popcorn } from "lucide-react";

export const MENU_CATEGORIES = [
  {
    id: "rice",
    icon: Utensils,
    iconName: "Utensils" as const,
    gradient: "from-orange-400 to-orange-600",
    bgLight: "bg-orange-50",
    borderColor: "border-orange-200",
    nameCn: "饭类",
    nameEn: "Rice / Bento",
    description: "所有含米饭的主餐",
  },
  {
    id: "noodles",
    icon: Soup,
    iconName: "Soup" as const,
    gradient: "from-amber-400 to-amber-600",
    bgLight: "bg-amber-50",
    borderColor: "border-amber-200",
    nameCn: "面类",
    nameEn: "Noodles",
    description: "所有汤面/干面",
  },
  {
    id: "dumplings",
    icon: Cookie,
    iconName: "Cookie" as const,
    gradient: "from-red-400 to-red-600",
    bgLight: "bg-red-50",
    borderColor: "border-red-200",
    nameCn: "饺子类",
    nameEn: "Dumplings",
    description: "饺子/云吞",
  },
  {
    id: "snacks",
    icon: Popcorn,
    iconName: "Popcorn" as const,
    gradient: "from-yellow-400 to-yellow-600",
    bgLight: "bg-yellow-50",
    borderColor: "border-yellow-200",
    nameCn: "零食小食",
    nameEn: "Snacks",
    description: "小食和开胃菜",
  },
] as const;

export type CategoryId = "rice" | "noodles" | "dumplings" | "snacks";

export type MenuCategory = (typeof MENU_CATEGORIES)[number];
