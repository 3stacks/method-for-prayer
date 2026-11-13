import AsyncStorage from '@react-native-async-storage/async-storage'
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'

// The settings and the intercession list stay on the device, in AsyncStorage.
// The app sends them nowhere.

export interface Prefs {
  /** An index into TEXT_SIZES. */
  textSize: number
  /** The heads of each part in the guided prayer of each day, 1 to 4. */
  perDay: number
}

export interface Intercession {
  id: string
  text: string
}

export const DEFAULT_PREFS: Prefs = { textSize: 1, perDay: 2 }
export const PER_DAY_CHOICES = [1, 2, 3, 4]
const KEY = 'methodforprayer:prefs'
const LIST_KEY = 'methodforprayer:intercessions'

function parse(raw: string | null): Prefs {
  try {
    const p = raw ? JSON.parse(raw) : {}
    return {
      textSize: Number.isInteger(p.textSize) && p.textSize >= 0 && p.textSize <= 3 ? p.textSize : DEFAULT_PREFS.textSize,
      perDay: PER_DAY_CHOICES.includes(p.perDay) ? p.perDay : DEFAULT_PREFS.perDay,
    }
  } catch {
    return DEFAULT_PREFS
  }
}

function parseList(raw: string | null): Intercession[] {
  try {
    const list = raw ? JSON.parse(raw) : []
    if (!Array.isArray(list)) return []
    return list
      .filter((x) => x && typeof x.id === 'string' && typeof x.text === 'string')
      .map((x) => ({ id: x.id, text: x.text }))
  } catch {
    return []
  }
}

const save = (key: string, value: unknown) =>
  AsyncStorage.setItem(key, JSON.stringify(value)).catch(() => {
    // Storage failed. The change lasts until the app closes.
  })

interface Store {
  prefs: Prefs
  update: (change: Partial<Prefs>) => void
  list: Intercession[]
  add: (text: string) => void
  remove: (id: string) => void
  loaded: boolean
}

const StoreContext = createContext<Store>({
  prefs: DEFAULT_PREFS,
  update: () => {},
  list: [],
  add: () => {},
  remove: () => {},
  loaded: false,
})

export function PrefsProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState(DEFAULT_PREFS)
  const [list, setList] = useState<Intercession[]>([])
  const [loaded, setLoaded] = useState(false)
  useEffect(() => {
    AsyncStorage.multiGet([KEY, LIST_KEY]).then(
      (rows) => {
        const map = new Map(rows)
        setPrefs(parse(map.get(KEY) ?? null))
        setList(parseList(map.get(LIST_KEY) ?? null))
        setLoaded(true)
      },
      () => setLoaded(true),
    )
  }, [])
  const update = useCallback((change: Partial<Prefs>) => {
    setPrefs((old) => {
      const next = { ...old, ...change }
      save(KEY, next)
      return next
    })
  }, [])
  const add = useCallback((text: string) => {
    const t = text.trim()
    if (!t) return
    setList((old) => {
      const next = [...old, { id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`, text: t }]
      save(LIST_KEY, next)
      return next
    })
  }, [])
  const remove = useCallback((id: string) => {
    setList((old) => {
      const next = old.filter((x) => x.id !== id)
      save(LIST_KEY, next)
      return next
    })
  }, [])
  return <StoreContext.Provider value={{ prefs, update, list, add, remove, loaded }}>{children}</StoreContext.Provider>
}

export const useStore = () => useContext(StoreContext)
export const usePrefs = (): [Prefs, (change: Partial<Prefs>) => void] => {
  const s = useContext(StoreContext)
  return [s.prefs, s.update]
}
