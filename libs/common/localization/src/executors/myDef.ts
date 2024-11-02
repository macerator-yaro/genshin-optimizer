import { dumpFile } from '@genshin-optimizer/common/pipeline'
import { existsSync, readFileSync, readdirSync } from 'fs'

// ------ 型定義 ------
export type ProjNames = 'common' | 'gi'
export type ProjLocales = 'en' | 'ja'

// ------ パス呼び出し ------
export const $localization = (cat: ProjNames) =>
  `${process.env['NX_WORKSPACE_ROOT']}/libs/${cat}/localization`
export const $locales = (cat: ProjNames) =>
  `${$localization(cat)}/assets/locales`
export const $l10n = `${$localization('common')}/l10n-ja`

// ------ 型定義 ------
export type tElements = string | string[] | Translation
export type Translation = { [key: string]: tElements }

// ------ 型チェック関数 ------
export function isTranslation(obj: tElements): obj is Translation {
  return !Array.isArray(obj) && typeof obj === 'object' && obj !== null
}

export function isEqualArray(arrA: string[], arrB: string[]): boolean {
  return (
    arrA.length === arrB.length && arrA.every((v, i) => arrA[i] === arrB[i])
  )
}

export function isEqualTerm(termA: tElements, termB: tElements): boolean {
  if (isTranslation(termA) || isTranslation(termB)) {
    return false
  } else if (Array.isArray(termA) && Array.isArray(termB)) {
    return isEqualArray(termA, termB)
  } else {
    return termA === termB
  }
}

export function isEqualTranslation(
  objA: Translation,
  objB: Translation
): boolean {
  return compare(objA, objB) && compare(objB, objA)

  function compare(objA: Translation, objB: Translation) {
    for (const key of Object.keys(objA)) {
      // objAにキーが存在しない場合
      if (!(key in objB)) {
        return false
      }
      // どちらもTranslationの場合
      else if (isTranslation(objA[key]) && isTranslation(objB[key])) {
        if (!compare(objA[key], objB[key])) return false
      }
      // 内容が異なる場合
      else if (!isEqualTerm(objA[key], objB[key])) {
        return false
      }
    }
    return true
  }
}

// ------ 比較・生成 関数 ------
export function getUntranslatedTerms(
  en: Translation,
  ja: Translation,
  ignore: IgnoreWs
) {
  const flatIgnore = flattenIgnore(ignore)
  return recursion(en, ja, '')

  function recursion(en: Translation, ja: Translation, parentKey: string) {
    const untranslated = {} as Translation
    Object.keys(ja).forEach((key) => {
      const crrKey = parentKey + key

      // 値がTranslationの場合
      if (isTranslation(en[key]) && isTranslation(ja[key])) {
        const ret = recursion(en[key], ja[key], `${crrKey}.`)
        if (Object.keys(ret).length) untranslated[key] = ret
      }
      // 値がTermの場合
      else if (!flatIgnore[crrKey] && isEqualTerm(en[key], ja[key])) {
        untranslated[key] = en[key]
      }
    })
    return untranslated
  }

  function flattenIgnore(
    ignore: IgnoreWs,
    parentKey = '',
    result = {} as { [key: string]: boolean }
  ) {
    for (const key in ignore) {
      const flatKey = parentKey + key
      if (typeof ignore[key] === 'boolean') {
        result[flatKey] = ignore[key]
      } else {
        flattenIgnore(ignore[key], `${flatKey}.`, result)
      }
    }
    return result
  }
}

export function getRemovedTerms(Old: Translation, New: Translation) {
  return recursion(Old, New)

  function recursion(Old: Translation, New: Translation) {
    const removed = {} as Translation
    Object.keys(Old).forEach((key) => {
      // キーが存在する場合
      if (key in New) {
        // 値がTranslationの場合
        if (isTranslation(Old[key]) && isTranslation(New[key])) {
          const ret = recursion(Old[key], New[key])
          if (Object.keys(ret).length) removed[key] = ret
        }
        // 値がTerm かつ 同一内容では無い場合
        else if (!isEqualTerm(Old[key], New[key])) {
          removed[key] = Old[key]
        }
      }
      // キーが存在しない場合
      else {
        removed[key] = Old[key]
      }
    })
    return removed
  }
}

// ------ ファイル入出力 ------
type WsFileNames = 'en' | 'ja' | 'untranslated' | 'ignore' | 'removed'
type IgnoreWs = { [key: string]: IgnoreWs | boolean }
export function readWorkspaceJson() {
  return {
    en: read('en') as Translation,
    ja: read('ja') as Translation,
    untranslated: read('untranslated') as Translation,
    ignore: read('ignore') as IgnoreWs,
    removed: read('removed') as object[],
  }

  function read(fn: WsFileNames) {
    const path = `${$l10n}/${fn}.json`
    const raw = readFileSync(path).toString()
    return JSON.parse(raw)
  }
}

export function saveWorkspaceJson(
  saveFiles: {
    en?: Translation
    ja?: Translation
    untranslated?: Translation
  },
  removedData?: {
    target: string
    date?: string
    values: Record<string, Translation>
  }
) {
  Object.entries(saveFiles).forEach(([fn, data]) => {
    dumpFile(`${$l10n}/${fn}.json`, data)
  })

  if (removedData && hasContent(removedData.values)) {
    removedData.date ??= new Date().toLocaleString('ja')
    const { removed: crrRemovedData } = readWorkspaceJson()
    const { target, date, values } = removedData
    crrRemovedData.unshift({ target, date, ...values })
    dumpFile(`${$l10n}/removed.json`, crrRemovedData)
  }

  function hasContent(values: Record<string, Translation>) {
    let returnValue = false
    Object.entries(values).forEach(([key, value]) => {
      const hasValid = Object.keys(value).length > 0
      if (!hasValid) delete values[key]
      returnValue ||= hasValid
    })
    return returnValue
  }
}

export function getMergedJson() {
  return {
    en: getMerge('en'),
    ja: getMerge('ja'),
  }

  function getMerge(locale: ProjLocales) {
    const result = {} as Translation
    merge(`${$locales('common')}/${locale}`, 'common_')
    merge(`${$locales('gi')}/${locale}`) // do not add prefix to gi files
    return result

    function merge(dir: string, prefix = '') {
      const jsonFiles = existsSync(dir)
        ? readdirSync(dir).filter((fn) => fn.endsWith('.json'))
        : []
      jsonFiles.forEach((jfile) => {
        let filename = jfile.split('.json')[0]
        // only add prefix if the prefix was not appended
        if (!filename.startsWith(prefix)) filename = prefix + filename
        const raw = readFileSync(`${dir}/${jfile}`).toString()
        const json = JSON.parse(raw)
        result[filename] = json
      })
    }
  }
}
