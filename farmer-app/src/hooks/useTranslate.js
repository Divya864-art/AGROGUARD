import { useContext, useEffect, useState } from "react";
import { LanguageContext } from "../context/LanguageContext";

export function useTranslate(text) {
  const { language } = useContext(LanguageContext);
  const [translated, setTranslated] = useState(text);

  useEffect(() => {
    // DEBUG LOG — DO NOT REMOVE YET


    if (language === "en") {
      setTranslated(text);
      return;
    }

    async function translate() {
      try {
        const url =
          "https://api.mymemory.translated.net/get?q=" +
          encodeURIComponent(text) +
          "&langpair=en|" +
          language;

        const res = await fetch(url);
        const data = await res.json();


        setTranslated(data.responseData.translatedText);
      } catch (e) {
        console.log("❌ TRANSLATION ERROR", e);
        setTranslated(text);
      }
    }

    translate();
  }, [language, text]);

  return translated;
}
