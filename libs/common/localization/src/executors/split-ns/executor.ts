import { dumpFile } from '@genshin-optimizer/common/pipeline'
import { existsSync, readFileSync, readdirSync } from 'fs'
import type { ProjNames, Translation } from '../myDef'
import {
  $locales,
  isEqualTranslation,
  isTranslation,
  readWorkspaceJson,
} from '../myDef'
import type { GenLocaleExecutorSchema } from './schema'

export default async function runExecutor(_options: GenLocaleExecutorSchema) {
  const { ja: jaJson } = readWorkspaceJson()
  saveFiles(jaJson)

  return { success: true }
}

function saveFiles(jaJson: Translation) {
  const outputLog: string[] = []

  Object.keys(jaJson).forEach((ns) => {
    const { dir, fn } = getSaveDirAndFileName(ns)
    const outputPath = `${dir}/${fn}`
    const fileList = existsSync(dir) ? readdirSync(dir) : []
    // 同名のファイルが存在する場合
    if (fileList.includes(fn)) {
      const existingRaw = readFileSync(outputPath).toString()
      const existingFile = JSON.parse(existingRaw) as Translation

      if (
        isTranslation(jaJson[ns]) &&
        !isEqualTranslation(existingFile, jaJson[ns])
      ) {
        dumpFile(outputPath, jaJson[ns])
        outputLog.push(outputPath)
      }
    }
    // 同名のファイルが存在しない場合
    else {
      dumpFile(outputPath, jaJson[ns])
      outputLog.push(outputPath)
    }
  })
  console.log(
    `outputs: ${outputLog.length ? `\n${outputLog.join('\n')}` : 'none'}`
  )
}

function getSaveDirAndFileName(ns: string) {
  const cat: ProjNames = ns.startsWith('common_') ? 'common' : 'gi'
  return {
    dir: `${$locales(cat)}/ja`,
    fn: `${ns.replace(/^common_/, '')}.json`,
  }
}
