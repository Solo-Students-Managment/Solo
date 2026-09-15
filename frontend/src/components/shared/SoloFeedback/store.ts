"use client";

import { create } from "zustand";

export type FeedbackTone = "info" | "success" | "warning" | "error";

export type FeedbackItem = {
  id: string;
  tone: FeedbackTone;
  title: string;
  description?: string;
};

type FeedbackState = {
  items: FeedbackItem[];
  push: (item: Omit<FeedbackItem, "id">) => string;
  dismiss: (id: string) => void;
  clear: () => void;
};

export const useFeedbackStore = create<FeedbackState>((set) => ({
  items: [],
  push: (item) => {
    const id = crypto.randomUUID();
    set((state) => ({ items: [...state.items, { ...item, id }] }));
    return id;
  },
  dismiss: (id) =>
    set((state) => ({ items: state.items.filter((item) => item.id !== id) })),
  clear: () => set({ items: [] }),
}));
