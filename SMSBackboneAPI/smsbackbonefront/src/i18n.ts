import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import HttpApi from "i18next-http-backend";

i18n
  .use(HttpApi)
  .use(initReactI18next)
  .init({
    fallbackLng: "es",
    debug: true,
    backend: {
      loadPath: "/RedQuantum/locales/{{lng}}/translation.json" // 🔥 carga las traducciones de la carpeta locales
    },
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: true,
    },
  });

export default i18n;
