import { useBreakpoints } from "@vueuse/core";

export const useAppBreakpoints = () => {
  const bp = useBreakpoints({
    xs: 0,
    sm: 576,
    md: 768,
    lg: 992,
    xl: 1200,
    "2xl": 1600,
  });

  return {
    xs: bp.greaterOrEqual("xs"),
    sm: bp.greaterOrEqual("sm"),
    md: bp.greaterOrEqual("md"),
    lg: bp.greaterOrEqual("lg"),
    xl: bp.greaterOrEqual("xl"),
    "2xl": bp.greaterOrEqual("2xl"),

    up: {
      sm: bp.greaterOrEqual("sm"),
      md: bp.greaterOrEqual("md"),
      lg: bp.greaterOrEqual("lg"),
      xl: bp.greaterOrEqual("xl"),
      "2xl": bp.greaterOrEqual("2xl"),
    },
    down: {
      sm: bp.smaller("sm"),
      md: bp.smaller("md"),
      lg: bp.smaller("lg"),
      xl: bp.smaller("xl"),
      "2xl": bp.smaller("2xl"),
    },
  };
};
