// colors

import { createTheme } from "@mui/material";

// export const primaryColor = "#004F71";//MTN MOMO BLUE
// export const primaryColor = "#1F5A2D";
export const primaryColor = "#2371B9";
export const primaryColor50 = "#3f7c500d";
export const secondaryColor = "#f1ab1e";
export const darkColor = "#212631";

export const antdTheme = {
  token: {
    colorPrimary: primaryColor,
    fontFamily: "'Montserrat', sans-serif",
  },
  components: {
    Button: {},
  },
};

export const muiTheme = createTheme({
  palette: {
    primary: {
      main: primaryColor,
    },
  },
  typography: {
    fontSize: 13,
    button: {
      textTransform: "none",
    },
  },
});