import { create } from "zustand";

interface BannerData {
  show: boolean;
  bannerKey?: string;
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

// Helper function to check if we're in a browser environment
const isBrowser = typeof window !== "undefined";

// Helper to check if a banner has been dismissed before
const hasBannerBeenDismissed = (bannerKey: string): boolean => {
  if (!isBrowser || !bannerKey) return false;

  const dismissedBanners = localStorage.getItem("dismissedBanners");
  if (!dismissedBanners) return false;

  try {
    const parsedDismissedBanners = JSON.parse(dismissedBanners);
    return parsedDismissedBanners.includes(bannerKey);
  } catch (error) {
    console.error("Error parsing dismissed banners from localStorage:", error);
    return false;
  }
};

// Helper to save a dismissed banner key to localStorage
const saveDismissedBanner = (bannerKey: string): void => {
  if (!isBrowser || !bannerKey) return;

  try {
    const dismissedBanners = localStorage.getItem("dismissedBanners");
    let parsedDismissedBanners: string[] = [];

    if (dismissedBanners) {
      parsedDismissedBanners = JSON.parse(dismissedBanners);
    }

    if (!parsedDismissedBanners.includes(bannerKey)) {
      parsedDismissedBanners.push(bannerKey);
      localStorage.setItem(
        "dismissedBanners",
        JSON.stringify(parsedDismissedBanners),
      );
    }
  } catch (error) {
    console.error("Error saving dismissed banner to localStorage:", error);
  }
};

export const useBannerStore = create<BannerStore>((set) => ({
  data: {
    show: false,
    text: "",
    link: "",
    linkText: "Learn More",
    bannerKey: "",
  },
  setBanner: (newData) => {
    // Check if this banner has been dismissed before
    if (newData.bannerKey && hasBannerBeenDismissed(newData.bannerKey)) {
      // If it has been dismissed, don't show it again
      set((state) => ({
        data: {
          ...state.data,
          ...newData,
          show: false,
        },
      }));
    } else {
      // Otherwise, show the banner with the new data
      set((state) => ({ data: { ...state.data, ...newData } }));
    }
  },
  hideBanner: () => {
    set((state) => {
      // If there's a bannerKey, save it to localStorage to prevent showing again
      if (state.data.bannerKey) {
        saveDismissedBanner(state.data.bannerKey);
      }

      return { data: { ...state.data, show: false } };
    });
  },
}));
