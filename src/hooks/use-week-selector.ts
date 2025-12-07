"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  startOfWeek,
  endOfWeek,
  addWeeks,
  format,
  eachDayOfInterval,
  isWeekend,
} from "date-fns";

export interface WeekOption {
  id: string;
  label: string;
  shortLabel: string;
  startDate: Date;
  endDate: Date;
  weekDays: Date[];
}

interface WeekSelectorState {
  currentWeekIndex: number;
  setCurrentWeekIndex: (index: number) => void;
  getWeekOptions: () => WeekOption[];
  getCurrentWeek: () => WeekOption;
}

// Generate week options (next week + following 3 weeks)
function generateWeekOptions(): WeekOption[] {
  const options: WeekOption[] = [];
  const today = new Date();

  for (let i = 0; i < 4; i++) {
    const weekStart = startOfWeek(addWeeks(today, i + 1), { weekStartsOn: 1 }); // Monday
    const weekEnd = endOfWeek(addWeeks(today, i + 1), { weekStartsOn: 1 });

    // Get only weekdays (Mon-Fri)
    const allDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
    const weekDays = allDays.filter((day) => !isWeekend(day));

    const label =
      i === 0
        ? `Next Week (${format(weekDays[0], "MMM d")} - ${format(
            weekDays[4],
            "d"
          )})`
        : `${format(weekDays[0], "MMM d")} - ${format(weekDays[4], "d")}`;

    options.push({
      id: `week-${i}`,
      label,
      shortLabel: `${format(weekDays[0], "MMM d")} - ${format(
        weekDays[4],
        "d"
      )}`,
      startDate: weekDays[0],
      endDate: weekDays[4],
      weekDays,
    });
  }

  return options;
}

export const useWeekSelector = create<WeekSelectorState>()(
  persist(
    (set, get) => ({
      currentWeekIndex: 0,
      setCurrentWeekIndex: (index) => set({ currentWeekIndex: index }),
      getWeekOptions: generateWeekOptions,
      getCurrentWeek: () => {
        const options = generateWeekOptions();
        return options[get().currentWeekIndex] || options[0];
      },
    }),
    {
      name: "week-selector-storage-v2",
    }
  )
);
