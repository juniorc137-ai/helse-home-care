import { useWindowDimensions } from "react-native";

/** Breakpoint desktop/mobile (seção 2.1: grid desktop com 4-6 cards vs. lista mobile 1-2 cards). */
export const DESKTOP_BREAKPOINT = 768;

export interface ResponsiveInfo {
  width: number;
  height: number;
  isDesktop: boolean;
  isMobile: boolean;
}

export function useResponsive(): ResponsiveInfo {
  const { width, height } = useWindowDimensions();
  const isDesktop = width >= DESKTOP_BREAKPOINT;
  return { width, height, isDesktop, isMobile: !isDesktop };
}
