import { useColorScheme } from 'react-native'

// A deep green, so that the app is not like its siblings (red, brown and navy).
// The second colour is an old gold, for numbers and small marks.
const light = {
  bg: '#f4f5ef',
  card: '#ffffff',
  paper2: '#e9ece3',
  ink: '#1a211c',
  muted: '#59645c',
  line: '#d0d8cd',
  accent: '#1f4d3a',
  gold: '#8a6a1f',
  highlight: '#efe3b8',
}
export type Colors = typeof light
const dark: Colors = {
  bg: '#111814',
  card: '#18211b',
  paper2: '#1c2620',
  ink: '#e2e6dd',
  muted: '#9aa79d',
  line: '#2b3a30',
  accent: '#8cc4a5',
  gold: '#d4b467',
  highlight: '#3f3a20',
}

export const useColors = (): Colors => (useColorScheme() === 'dark' ? dark : light)

/** Source Serif 4, loaded in src/app/_layout.tsx. */
export const serif = {
  regular: 'SourceSerif4_400Regular',
  italic: 'SourceSerif4_400Regular_Italic',
  semibold: 'SourceSerif4_600SemiBold',
  semiboldItalic: 'SourceSerif4_600SemiBold_Italic',
}

/** The text sizes in Settings, as a scale of the normal size. */
export const TEXT_SIZES = [
  { label: 'Small', scale: 0.9 },
  { label: 'Normal', scale: 1 },
  { label: 'Large', scale: 1.15 },
  { label: 'Largest', scale: 1.32 },
]
