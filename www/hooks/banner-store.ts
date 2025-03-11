import { create } from "zustand";

interface BannerData {
  show: boolean;
  text: string;
  link?: string;
  linkText?: string;
  backgroundColor?: string;
  textColor?: string;
}

interface BannerStore {
  data: BannerData;
  setBanner: (data: Partial<BannerData>) => void;
  hideBanner: () => void;
}

export const useBannerStore = create<BannerStore>((set) => ({
  data: {
    show: false,
    text: "",
    link: "",
    linkText: "Learn More",
  },
  setBanner: (newData) =>
    set((state) => ({ data: { ...state.data, ...newData } })),
  hideBanner: () => set((state) => ({ data: { ...state.data, show: false } })),
}));
