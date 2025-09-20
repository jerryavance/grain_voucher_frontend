import { CssBaseline, ThemeProvider } from "@mui/material";
import { StyledEngineProvider } from "@mui/material/styles";
import { FC } from "react";
import { Toaster } from "react-hot-toast";
import { useRoutes } from "react-router-dom";
import { ConfigProvider } from "antd";
import routes from "./routes/routes";
import { ukoTheme } from "./theme";
import InternetConnection from "./components/UI/InternetConnection";
import { antdTheme } from "./components/UI/Theme";

const App: FC = () => {
  const allPages = useRoutes(routes);

  // App theme
  const appTheme = ukoTheme();

  // toaster options
  const toasterOptions = {
    style: {
      fontWeight: 500,
      fontFamily: "'Montserrat', sans-serif",
    },
  };

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={appTheme}>
        <ConfigProvider theme={antdTheme}>
          <CssBaseline />
          <InternetConnection />
          <Toaster toastOptions={toasterOptions} />
          {allPages}
        </ConfigProvider>
      </ThemeProvider>
    </StyledEngineProvider>
  );
};

export default App;

// TODO: change background color of the app to #f8f8f8
