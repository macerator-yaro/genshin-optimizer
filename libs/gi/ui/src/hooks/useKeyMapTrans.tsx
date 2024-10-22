import { baseMap, KeyMap } from '@genshin-optimizer/gi/keymap'
import type { i18n, TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'

type variationObj = { key: string } & (
  | { start: string; end?: string }
  | { start?: string; end: string }
)
const templateVariation: Record<string, variationObj[] | undefined> = {
  critDMG: [
    { key: 'critDmgBonus', end: 'CRIT DMG Bonus' },
    { key: 'critDmg', end: 'Crit DMG' },
  ],
  critRate: [
    { key: 'critRateBonus', end: 'CRIT Rate Bonus' },
    { key: 'critRate', end: 'Crit Rate' },
  ],
  enemyRes: [{ key: 'enemyRes', start: 'Enemy', end: 'DMG RES' }],
  dmgInc: [{ key: 'dmgInc', end: 'DMG Increase' }],
  dmg: [{ key: 'dmg', end: 'DMG Bonus' }],
  res: [{ key: 'res', end: 'DMG RES' }],
  hit: [{ key: 'hit', end: 'DMG' }],
  multi: [{ key: 'multi', end: 'Multiplier' }],
  crystallize: [{ key: 'crystallize', end: 'Crystallize' }],
}

const getVariationKey = (key: string, templateKey: string) => {
  // Determine which variation the templateKey matches to by comparing it with the value of `KeyMap.get()`.
  const keymapValue = KeyMap.get(key)
  return templateVariation[templateKey]?.find(
    ({ start, end }) =>
      (start ? keymapValue.startsWith(start) : true) &&
      (end ? keymapValue.endsWith(end) : true)
  )?.key
}
const getTranslation = (
  t: TFunction,
  key: string,
  section: 'baseMap' | 'template' | 'attribute',
  attribute?: string
) => {
  const tKey = `${section}.${key}`
  const translation = t(tKey, { attribute })
  return translation === tKey ? undefined : translation
}

const getTranslatedKeyMapString = (t: TFunction, i18n: i18n, key: string) => {
  if (i18n.resolvedLanguage === 'en' || typeof key !== 'string')
    return undefined
  if (key in baseMap) return getTranslation(t, key, 'baseMap')

  // After removing the suffix, split the key at the last "_".
  // For example: "plunging_impact_critDMG_" -> ["plunging_impact", "critDMG"]
  const [attributeKey, templateKey] = key.replace(/_$/, '').split(/_(?=[^_]+$)/)
  if (!(attributeKey && templateKey)) return undefined

  const variationKey = getVariationKey(key, templateKey)
  const attributeStr = getTranslation(t, attributeKey, 'attribute')
  return (
    variationKey &&
    attributeStr &&
    getTranslation(t, variationKey, 'template', attributeStr)
  )
}

export type KeyMapTrans = {
  get: typeof KeyMap.get
  getStr: typeof KeyMap.getStr
}
/**
 * Wraps the `KeyMap.get()` and `KeyMap.getStr()` functionality with i18n support.
 * If the translation is successful, it returns the translated string; otherwise, it falls back to the value from the KeyMap.
 */
export const useKeyMapTrans = (): KeyMapTrans => {
  const { t, i18n } = useTranslation('keymap')
  return {
    get: (key = '') =>
      getTranslatedKeyMapString(t, i18n, key) || KeyMap.get(key),
    getStr: (key = '') =>
      getTranslatedKeyMapString(t, i18n, key) || KeyMap.getStr(key),
  }
}

export function KeyMapTranslate({ key18 = '' }) {
  const { get } = useKeyMapTrans()
  return <>{get(key18)}</>
}
