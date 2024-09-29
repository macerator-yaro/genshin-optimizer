import { dumpFile } from '@genshin-optimizer/common/pipeline'
import { existsSync, readFileSync, readdirSync } from 'fs'
import type { ProjNames, Translation } from '../myDef'
import {
  $l10n,
  $locales,
  isSameTrans,
  isTrans,
  readWorkspaceJson,
} from '../myDef'
import type { GenLocaleExecutorSchema } from './schema'

export default async function runExecutor(_options: GenLocaleExecutorSchema) {
  const $ja = (cat: ProjNames) => `${$locales(cat)}/ja`
  const jaJson = applyChanges()
  saveFiles(jaJson)

  return { success: true }

  function saveFiles(jaJson: Translation) {
    const outputLog: string[] = []

    const jaJsonPath = `${$l10n('common')}/ja.json`
    const jaJsonRaw = readFileSync(jaJsonPath).toString()
    const existJaJson = JSON.parse(jaJsonRaw) as Translation

    if (!isSameTrans(jaJson, existJaJson)) {
      outputLog.push(jaJsonPath)
      dumpFile(jaJsonPath, jaJson)
    }

    Object.keys(jaJson).forEach((fn) => {
      const { dir, fName } = getDirAndFn(fn)
      const outputPath = `${dir}/${fName}.json`
      const fileList = existsSync(dir) ? readdirSync(dir) : []
      // 同名のファイルが存在する場合
      if (fileList.includes(fName + '.json')) {
        const raw = readFileSync(outputPath).toString()
        const exist = JSON.parse(raw) as Translation

        if (isTrans(jaJson[fn]) && !isSameTrans(exist, jaJson[fn])) {
          dumpFile(outputPath, jaJson[fn])
          outputLog.push(outputPath)
        }
      }
      // 同名のファイルが存在しない場合
      else {
        dumpFile(outputPath, jaJson[fn])
        outputLog.push(outputPath)
      }
    })
    console.log(
      `outputs:${outputLog.length ? '\n' + outputLog.join('\n') : ' none'}`
    )
  }

  function applyChanges() {
    const { enJson, jaJson, sameJson } = readWorkspaceJson()
    compare(enJson, jaJson, sameJson)
    return jaJson

    function compare(
      enJson: Translation,
      jaJson: Translation,
      sameJson: Translation
    ) {
      Object.keys(sameJson).forEach((key) => {
        if (
          isTrans(enJson[key]) &&
          isTrans(jaJson[key]) &&
          isTrans(sameJson[key])
        ) {
          compare(enJson[key], jaJson[key], sameJson[key])
        } else {
          if (sameJson[key] !== enJson[key]) jaJson[key] = sameJson[key]
        }
      })
    }
  }

  function getDirAndFn(fn: string) {
    let cat: ProjNames = 'gi'
    const splitArr = fn.split(/(common_)/)
    if (splitArr[0] === '') {
      if (splitArr[1] === 'common_') cat = 'common'
    }
    return { dir: $ja(cat), fName: splitArr[splitArr.length - 1] }
  }
}
