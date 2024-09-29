import { readFileSync, readdirSync } from 'fs'

export type ProjNames = 'common' | 'gi'
export type ProjLang = 'en' | 'ja'

export const $localization = (cat: ProjNames) =>
  `${process.env['NX_WORKSPACE_ROOT']}/libs/${cat}/localization`
export const $locales = (cat: ProjNames) =>
  `${$localization(cat)}/assets/locales`
export const $l10n = (cat: ProjNames) => `${$localization(cat)}/l10n-ja`

export type tElements = string | string[] | Translation
export type Translation = { [key: string]: tElements }

export const isTrans = (obj: tElements): obj is Translation =>
  !Array.isArray(obj) && typeof obj === 'object' && obj !== null

export function isSameTrans(objA: Translation, objB: Translation): boolean {
  return compare(objA, objB) && compare(objB, objA)

  function compare(objA: Translation, objB: Translation) {
    for (const key of Object.keys(objA)) {
      // objAにキーが存在しない場合
      if (!(key in objB)) return false

      // どちらもArrayの場合
      if (Array.isArray(objA[key]) && Array.isArray(objB[key])) {
        if (objA[key].length !== objB[key].length) return false
        for (let i = 0; i < objA[key].length; i++) {
          if (objA[key][i] !== objB[key][i]) return false
        }
      }
      // どちらもTranslationの場合
      else if (isTrans(objA[key]) && isTrans(objB[key])) {
        const re = isSameTrans(objA[key], objB[key])
        if (!re) return false
      }
      // 内容が異なる場合
      else if (objA[key] !== objB[key]) {
        return false
      }
    }
    return true
  }
}

export function readWorkspaceJson() {
  return {
    enJson: read('en') as Translation,
    jaJson: read('ja') as Translation,
    sameJson: read('same') as Translation,
    ignoreJson: read('ignore') as string[],
    diffJson: read('diff') as object[],
  }

  type wsJsonName = 'en' | 'ja' | 'same' | 'ignore' | 'diff'
  function read(fn: wsJsonName) {
    const path = `${$l10n('common')}/${fn}.json`
    const raw = readFileSync(path).toString()
    return JSON.parse(raw)
  }
}

export function getMergeJson(lang: ProjLang) {
  const result = {} as Translation

  function merge(dir: string, prefix = '') {
    const jsonFiles = readdirSync(dir).filter((fn) => fn.endsWith('.json'))

    jsonFiles.forEach((jfile) => {
      let filename = jfile.split('.json')[0]
      // only add prefix if the prefix was not appended
      if (!filename.startsWith(prefix)) filename = prefix + filename
      const raw = readFileSync(dir + jfile).toString()
      const json = JSON.parse(raw)
      result[filename] = json
    })
  }
  merge(`${$locales('common')}/${lang}/`, 'common_')
  merge(`${$locales('gi')}/${lang}/`) // do not add prefix to gi files
  return result
}
