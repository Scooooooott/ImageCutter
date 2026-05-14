import { createContext, useContext, useState } from 'react'
import zh from './zh'
import en from './en'
import es from './es'
import fr from './fr'
import ca from './ca'
import ja from './ja'

export const LANGS = [
  { code: 'zh', label: '中文' },
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'ca', label: 'Català' },
  { code: 'ja', label: '日本語' },
]

const dictionaries = { zh, en, es, fr, ca, ja }

const LangContext = createContext(null)

export function LangProvider({ children }) {
  const [lang, setLang] = useState('en')
  const t = (key) => dictionaries[lang][key] ?? key
  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang() {
  return useContext(LangContext)
}
