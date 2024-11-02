import { deepClone } from '@genshin-optimizer/common/util'
import {
  getRemovedTerms,
  getUntranslatedTerms,
  isEqualTerm,
  isTranslation,
  readWorkspaceJson,
  saveWorkspaceJson,
  type Translation,
} from '../myDef'
import type { GenLocaleExecutorSchema } from './schema'

export default async function runExecutor(_options: GenLocaleExecutorSchema) {
  const { en: enWs, ja: jaWs, untranslated, ignore } = readWorkspaceJson()
  const jaApplied = getTranslationAppliedJa(enWs, jaWs, untranslated)
  const newUntrans = getUntranslatedTerms(enWs, jaApplied, ignore)

  saveWorkspaceJson(
    {
      ja: jaApplied,
      untranslated: newUntrans,
    },
    {
      target: 'apply-translation',
      values: {
        untranslated: getRemovedTerms(untranslated, jaApplied),
      },
    }
  )

  return { success: true }
}

function getTranslationAppliedJa(
  enWs: Translation,
  jaWs: Translation,
  untranslated: Translation
) {
  const returnObj = deepClone(jaWs)
  recursion(enWs, returnObj, untranslated)
  return returnObj

  function recursion(
    en: Translation,
    ja: Translation,
    untranslated: Translation
  ) {
    Object.keys(untranslated).forEach((key) => {
      // 値がTranslationの場合
      if (
        isTranslation(en[key]) &&
        isTranslation(ja[key]) &&
        isTranslation(untranslated[key])
      ) {
        recursion(en[key], ja[key], untranslated[key])
      }
      // 値がTermの場合
      else if (isEqualTerm(en[key], ja[key])) {
        ja[key] = untranslated[key]
      }
    })
  }
}
