import { createTheme } from "@mui/material/styles";
const theme = createTheme({
  palette: {
    primary: {
      main: "rgba(94, 19, 33, 1)",
      white: "rgba(255, 255, 255, 1)",
    },
    secondary: {
      main: "rgba(255, 80, 120, 1)",
    },
    neutral: {
      blue: "rgb(83, 131, 232)",
      black: "rgba(31, 31, 31, 1)",
      lightGrey: "rgba(93, 95, 99, 1)",
      grey: "rgba(93, 95, 99, 1)",
      darkBrown: "rgba(94, 19, 33, 1)",
      deepPink: "rgba(255, 21, 114, 1)",
      Charcoal: "rgba(34, 37, 41, 1)",
      lightGrey: "rgba(90, 100, 116, 1)",
      white: "rgba(255, 255, 255, 1)",
      ligthColor: "rgba(210, 213, 217, 1)",
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
      deepPink: "rgba(226, 0, 126, 1)",
      deepPink: "rgba(255, 21, 114, 1)",
      transparentBlack: "rgba(0, 0, 0, 0.25)",

    },
    background: {
      darkBrown: "rgba(94, 19, 33, 1)",
      lightgray: "rgba(217, 217, 217, 1)",
      deepPink: "rgba(255, 21, 114, 1)",
      deepMaroon: "rgba(116, 0, 46, 1)",
      softPink: "rgba(254, 107, 123, 1)",
      lightGray: "#D9D9D9",
      deepMaroon: "#74002E",
      
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
