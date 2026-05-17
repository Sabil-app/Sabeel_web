import { createContext, useContext, useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import translations from "i18n/translations";

const STORAGE_KEY = "sabeel.lang";
const DEFAULT_LANG = "fr";
const RTL_LANGS = ["ar"];

const LanguageContext = createContext({
  lang: DEFAULT_LANG,
  setLang: () => {},
  t: (key) => key,
  dir: "ltr",
});

function resolveKey(dict, key) {
  if (!dict) return undefined;
  return key
    .split(".")
    .reduce((acc, part) => (acc && acc[part] != null ? acc[part] : undefined), dict);
}

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    if (typeof window === "undefined") return DEFAULT_LANG;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored && translations[stored] ? stored : DEFAULT_LANG;
  });

  const setLang = (code) => {
    if (!translations[code]) return;
    setLangState(code);
    try {
      window.localStorage.setItem(STORAGE_KEY, code);
    } catch (e) {
      /* noop */
    }
  };

  const dir = RTL_LANGS.includes(lang) ? "rtl" : "ltr";

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("lang", lang);
      document.documentElement.setAttribute("dir", dir);
    }
  }, [dir, lang]);

  const value = useMemo(() => {
    const t = (key) => {
      const fromLang = resolveKey(translations[lang], key);
      if (fromLang != null) return fromLang;
      const fallback = resolveKey(translations[DEFAULT_LANG], key);
      return fallback != null ? fallback : key;
    };
    return { lang, setLang, t, dir };
  }, [lang, dir]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

LanguageProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useTranslation() {
  return useContext(LanguageContext);
}

export default LanguageContext;
