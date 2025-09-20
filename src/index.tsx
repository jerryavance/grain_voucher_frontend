import "nprogress/nprogress.css";
import { StrictMode } from "react";
import ReactDOM from "react-dom";
import "react-image-lightbox/style.css";
import { BrowserRouter } from "react-router-dom";
import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";
import '@coreui/coreui/dist/css/coreui.min.css'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import App from "./App";

import "./assets/css/index.css";
import { AuthProvider } from "./contexts/JWTAuthContext";
import SettingsProvider from "./contexts/SettingsContext";
import TitleContextProvider from "./contexts/TitleContext";

ReactDOM.render(
  <StrictMode>
    <AuthProvider>
      <SettingsProvider>
        <TitleContextProvider>
          <BrowserRouter>
          <DndProvider backend={HTML5Backend}>
            <App />
          </DndProvider>
          </BrowserRouter>
        </TitleContextProvider>
      </SettingsProvider>
    </AuthProvider>
  </StrictMode>,
  document.getElementById("root")
);
