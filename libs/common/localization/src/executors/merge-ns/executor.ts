import {
  getMergedJson,
  getRemovedTerms,
  getUntranslatedTerms,
  isTranslation,
  readWorkspaceJson,
  saveWorkspaceJson,
  type Translation,
} from '../myDef'
import type { GenLocaleExecutorSchema } from './schema'

export default async function runExecutor(_options: GenLocaleExecutorSchema) {
  const { en: enWs, ja: jaWs, untranslated, ignore } = readWorkspaceJson()
  const { en: enMerged, ja: jaMerged } = getMergedJson()
  const jaReordered = addEnToJa(enMerged, jaMerged)
  const newUntrans = getUntranslatedTerms(enMerged, jaReordered, ignore)

  saveWorkspaceJson(
    {
      en: enMerged,
      ja: jaReordered,
      untranslated: newUntrans,
    },
    {
      target: 'merge-ns',
      values: {
        en: getRemovedTerms(enWs, enMerged),
        ja: getRemovedTerms(jaWs, jaReordered),
        untranslated: getRemovedTerms(untranslated, newUntrans),
      },
    }
  )

  return { success: true }
}

function addEnToJa(en: Translation, ja: Translation) {
  return recursion(en, ja)

  function recursion(en: Translation, ja: Translation) {
    const reordered = {} as Translation
    Object.keys(en).forEach((key) => {
      // キーが存在する場合
      if (key in ja) {
        // 値がTranslationの場合
        if (isTranslation(en[key]) && isTranslation(ja[key])) {
          const ret = recursion(en[key], ja[key])
          if (Object.keys(ret).length) reordered[key] = ret
        }
        // 値がTermの場合
        else {
          reordered[key] = ja[key]
        }
      }
      // キーが存在しない かつ "_one"で終わらない場合
      else if (!key.endsWith('_one')) {
        reordered[key] = en[key]
      }
    })
    return reordered
  }
}
