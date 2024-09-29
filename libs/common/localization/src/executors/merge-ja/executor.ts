import { dumpFile } from '@genshin-optimizer/common/pipeline'
import type { Translation } from '../myDef'
import { $l10n, getMergeJson, isTrans, readWorkspaceJson } from '../myDef'
import type { GenLocaleExecutorSchema } from './schema'

export default async function runExecutor(_options: GenLocaleExecutorSchema) {
  const newJson = getMergeJson('ja')
  const { jaJson: oldJson, diffJson } = readWorkspaceJson()
  const { diff, merged } = saveDiff(newJson, oldJson)

  diffJson.unshift(diff)
  dumpFile(`${$l10n('common')}/diff.json`, diffJson)
  dumpFile(`${$l10n('common')}/ja.json`, merged)

  return { success: true }

  function saveDiff(newObj: Translation, oldObj: Translation) {
    const copyNew = JSON.parse(JSON.stringify(newObj)) as Translation
    mergeDeleted(copyNew, oldObj)
    return {
      diff: {
        type: 'merge-ja',
        date: new Date().toLocaleString('ja'),
        overwrited: saveOverwrited(newObj, oldObj),
      },
      merged: copyNew,
    }

    function saveOverwrited(newObj: Translation, oldObj: Translation) {
      const overwrited = {} as Translation
      for (const newKey of Object.keys(newObj)) {
        // oldObjにキーが存在しない場合
        if (!(newKey in oldObj)) continue

        // どちらもTranslationの場合
        if (isTrans(newObj[newKey]) && isTrans(oldObj[newKey])) {
          const re = saveOverwrited(newObj[newKey], oldObj[newKey])
          if (Object.keys(re).length) overwrited[newKey] = re
        }
        // どちらもArrayの場合
        else if (
          Array.isArray(newObj[newKey]) &&
          Array.isArray(oldObj[newKey])
        ) {
          if (newObj[newKey].length !== oldObj[newKey].length) {
            overwrited[newKey] = oldObj[newKey]
          } else {
            for (let i = 0; i < newObj[newKey].length; i++) {
              if (newObj[newKey][i] !== oldObj[newKey][i]) {
                overwrited[newKey] = oldObj[newKey]
                break
              }
            }
          }
        }
        // 内容が異なる場合
        else if (newObj[newKey] !== oldObj[newKey]) {
          overwrited[newKey] = oldObj[newKey]
        }
      }
      return overwrited
    }

    function mergeDeleted(newObj: Translation, oldObj: Translation) {
      for (const oldKey of Object.keys(oldObj)) {
        // oldObjにキーが存在しない場合
        if (!(oldKey in newObj)) {
          newObj[oldKey] = oldObj[oldKey]
          continue
        }

        // どちらもTranslationの場合
        if (isTrans(newObj[oldKey]) && isTrans(oldObj[oldKey])) {
          mergeDeleted(newObj[oldKey], oldObj[oldKey])
        }
      }
    }
  }
}
