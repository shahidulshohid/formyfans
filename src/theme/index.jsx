import { createTheme } from "@mui/material/styles";
const theme = createTheme({
  palette: {
    primary: {
      main: "#5e1321",
    },
    secondary: {
      main: "#ff2d78",
      light: "#f5c0d3",
    },
    colors: {
      white: "#ffffff",
      black: "#000000",
      candyBlack: "#210a18",
      lightPink: "#fbf4f7",
      lavenderBlush: "#fcf1f5",
      appPink: "#ff2d78",
      mauveTaupe: "#6d4e5d",
    },
    neutral: {
      blue: "rgb(83, 131, 232)",
      black: "rgba(31, 31, 31, 1)",
      grey: "rgba(93, 95, 99, 1)",
      darkBrown: "rgba(94, 19, 33, 1)",
      deepPink: "rgba(255, 21, 114, 1)",
      Charcoal: "rgba(34, 37, 41, 1)",
      lightGrey: "rgba(90, 100, 116, 1)",
      white: "rgba(255, 255, 255, 1)",
      ligthColor: "rgb(238, 239, 240)",
      darkBlack: "rgba(0, 0, 0, 1)",
      darkGrey: "rgba(151, 151, 151, 1)",
      mediumGrey: "rgba(153, 159, 170, 1)",
    },
    text: {
      darkBrown: "rgba(94, 19, 33, 1)",
      white: "rgba(255, 255, 255, 1)",
      halfWhite: "rgba(255, 255, 255, 0.5)",
      neutralGrey: "rgba(142, 142, 142, 1)",
      Charcoal: "rgba(40, 40, 40, 1)",
      deepPink: "rgba(255, 21, 114, 1)",
      transparentBlack: "rgba(0, 0, 0, 0.25)",
    },
    background: {
      darkBrown: "rgba(94, 19, 33, 1)",
      lightgray: "rgba(217, 217, 217, 1)",
      deepPink: "rgba(255, 21, 114, 1)",
      deepMaroon: "#74002E",
      softPink: "rgba(254, 107, 123, 1)",
      softPinkLight: "rgba(249, 153, 164, 0.1)",
      white: "rgba(255, 255, 255, 1)",
      lightGray: "#D9D9D9",
    },
  },
  typography: {
    fontFamily: "Montserrat, sans-serif",
    h1: {
      fontSize: "2rem",
      fontWeight: 700,
    },
    h6: {
      color: "rgba(31, 31, 31, 1)",
      fontWeight: 700,
      fontFamily: "Montserrat, sans-serif",
    },
    body2: {
      fontSize: "18px",
      color: "rgba(93, 95, 99, 1)",
    },
    body1: {
      fontSize: "1rem",
    },
  },
  MuiButton: {
    styleOverrides: {
      root: {
        textTransform: "none",
        borderRadius: "12px",
        fontWeight: 600,
        fontSize: "16px",
        padding: "10px 24px",
        transition: "all 0.3s ease",
      },
    },
    variants: [
      {
        props: { variant: "seachBtn" },
        style: {
          backgroundColor: "yellow",
          color: "#fff",
          boxShadow: "0 3px 5px 2px rgba(255, 105, 135, .3)",
          "&:hover": {
            boxShadow: "0 6px 10px 4px rgba(255, 105, 135, .3)",
          },
        },
      },
    ],
  },
});

export default theme;
