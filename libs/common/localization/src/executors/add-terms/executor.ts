import { dumpFile } from '@genshin-optimizer/common/pipeline'
import type { Translation } from '../myDef'
import { $l10n, getMergeJson, isTrans, readWorkspaceJson } from '../myDef'
import type { GenLocaleExecutorSchema } from './schema'

export default async function runExecutor(_options: GenLocaleExecutorSchema) {
  const enJson = getMergeJson('en')
  const { jaJson, ignoreJson, diffJson } = readWorkspaceJson()
  const { ro, sm } = addTerms(enJson, jaJson)
  const rm = getRemove(enJson, jaJson)

  diffJson.unshift({
    type: 'add-terms',
    date: new Date().toLocaleString(),
    removed: rm,
  })
  dumpFile(`${$l10n('common')}/ja.json`, ro)
  dumpFile(`${$l10n('common')}/same.json`, sm)
  dumpFile(`${$l10n('common')}/removed.json`, rm)
  dumpFile(`${$l10n('common')}/en.json`, enJson)
  dumpFile(`${$l10n('common')}/diff.json`, diffJson)

  return { success: true }

  function addTerms(enJson: Translation, jaJson: Translation, beforeKey = '') {
    const reordered = {} as Translation
    const same = {} as Translation

    // enJsonのキーの順番を取得し、それに従ってjaJsonのキーを並べ替える
    Object.keys(enJson).forEach((enKey) => {
      const crrKey = beforeKey + enKey

      // jaJsonにenKeyが存在する場合
      if (enKey in jaJson) {
        // 値がオブジェクトの場合、再帰する
        if (isTrans(enJson[enKey]) && isTrans(jaJson[enKey])) {
          const { ro, sm } = addTerms(
            enJson[enKey],
            jaJson[enKey],
            crrKey + '.'
          )
          reordered[enKey] = ro
          if (Object.keys(sm).length) same[enKey] = sm
        }
        // 値がテキストの場合
        else {
          reordered[enKey] = jaJson[enKey]
          if (!ignoreJson.includes(crrKey) && enJson[enKey] === jaJson[enKey])
            same[enKey] = enJson[enKey]
        }
      }
      // jaJsonにenKeyが存在しない場合
      else if (!enKey.endsWith('_one')) {
        reordered[enKey] = enJson[enKey]
        if (!ignoreJson.includes(crrKey)) same[enKey] = enJson[enKey]
      }
    })

    return { ro: reordered, sm: same }
  }

  function getRemove(enJson: Translation, jaJson: Translation) {
    const removed = {} as Translation

    Object.keys(jaJson).forEach((jaKey) => {
      // enJsonにjaKeyが存在する場合
      if (jaKey in enJson) {
        // 値がオブジェクトの場合、再帰する
        if (isTrans(jaJson[jaKey]) && isTrans(enJson[jaKey])) {
          const rm = getRemove(enJson[jaKey], jaJson[jaKey])
          if (Object.keys(rm).length) removed[jaKey] = rm
        }
        // enJsonにjaKeyが存在しない場合
      } else {
        removed[jaKey] = jaJson[jaKey]
      }
    })

    return removed
  }
}
