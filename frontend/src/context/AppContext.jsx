import React, { createContext, useContext, useState, useCallback } from "react";

const AppContext = createContext(null);

export const useApp = () => useContext(AppContext);

const LANG_LABELS = {
  en: { name: "English", code: "EN" },
  hi: { name: "हिन्दी", code: "HI" },
  kn: { name: "ಕನ್ನಡ", code: "KN" },
};

export const UI_STRINGS = {
  en: {
    tagline: "Your AI-powered health navigator — humans & animals",
    dashboard: "Dashboard",
    chat: "AI Chat",
    cost: "Cost Estimator",
    hospitals: "Hospitals",
    schemes: "Govt Schemes",
    emergency: "Emergency",
    history: "Health Records",
    diagnose: "Image Check",
    ayurveda: "Ayurveda",
    farmer: "Farmer Mode",
    map: "Map",
    wearable: "Wearable",
    humanMode: "Human",
    animalMode: "Animal",
    askSomething: "Ask about a symptom, cost, or scheme…",
    send: "Send",
  },
  hi: {
    tagline: "आपका AI स्वास्थ्य सहायक — मनुष्य और पशु के लिए",
    dashboard: "डैशबोर्ड",
    chat: "AI चैट",
    cost: "खर्च अनुमान",
    hospitals: "अस्पताल",
    schemes: "सरकारी योजनाएँ",
    emergency: "आपातकालीन",
    history: "स्वास्थ्य रिकॉर्ड",
    diagnose: "छवि जांच",
    ayurveda: "आयुर्वेद",
    farmer: "किसान मोड",
    map: "मानचित्र",
    wearable: "वियरेबल",
    humanMode: "मानव",
    animalMode: "पशु",
    askSomething: "लक्षण, खर्च या योजना के बारे में पूछें…",
    send: "भेजें",
  },
  kn: {
    tagline: "ನಿಮ್ಮ AI ಆರೋಗ್ಯ ಸಹಾಯಕ — ಮಾನವ ಮತ್ತು ಪ್ರಾಣಿಗಳಿಗೆ",
    dashboard: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    chat: "AI ಚಾಟ್",
    cost: "ಖರ್ಚು ಅಂದಾಜು",
    hospitals: "ಆಸ್ಪತ್ರೆಗಳು",
    schemes: "ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು",
    emergency: "ತುರ್ತು",
    history: "ಆರೋಗ್ಯ ದಾಖಲೆಗಳು",
    diagnose: "ಚಿತ್ರ ಪರೀಕ್ಷೆ",
    ayurveda: "ಆಯುರ್ವೇದ",
    farmer: "ರೈತ ಮೋಡ್",
    map: "ನಕ್ಷೆ",
    wearable: "ವೇರಬಲ್",
    humanMode: "ಮಾನವ",
    animalMode: "ಪ್ರಾಣಿ",
    askSomething: "ಲಕ್ಷಣ, ಖರ್ಚು ಅಥವಾ ಯೋಜನೆಯ ಬಗ್ಗೆ ಕೇಳಿ…",
    send: "ಕಳುಹಿಸಿ",
  },
};

export const AppProvider = ({ children }) => {
  const [mode, setMode] = useState(() => localStorage.getItem("healai_mode") || "human");
  const [language, setLanguage] = useState(() => localStorage.getItem("healai_lang") || "en");
  const [city, setCity] = useState(() => localStorage.getItem("healai_city") || "Bangalore");

  const changeMode = useCallback((m) => {
    setMode(m);
    localStorage.setItem("healai_mode", m);
  }, []);
  const changeLanguage = useCallback((l) => {
    setLanguage(l);
    localStorage.setItem("healai_lang", l);
  }, []);
  const changeCity = useCallback((c) => {
    setCity(c);
    localStorage.setItem("healai_city", c);
  }, []);

  const t = (key) => (UI_STRINGS[language] && UI_STRINGS[language][key]) || UI_STRINGS.en[key] || key;

  return (
    <AppContext.Provider
      value={{ mode, language, city, changeMode, changeLanguage, changeCity, t, LANG_LABELS }}
    >
      {children}
    </AppContext.Provider>
  );
};
