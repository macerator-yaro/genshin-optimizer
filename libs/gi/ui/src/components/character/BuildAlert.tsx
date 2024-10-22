import { timeStringMs } from '@genshin-optimizer/common/util'
import type { CharacterKey, GenderKey } from '@genshin-optimizer/gi/consts'
import { Alert, Grid, LinearProgress, Typography, styled } from '@mui/material'
import { useMemo, type ReactNode } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { CharacterName } from './Trans'

export const warningBuildNumber = 10000000
export type BuildStatus = {
  type: 'active' | 'inactive'
  tested: number // tested, including `failed`
  failed: number // tested but fail the filter criteria, e.g., not enough EM
  skipped: number
  total: number
  startTime?: number
  finishTime?: number
}

export function initialBuildStatus(): BuildStatus {
  return {
    type: 'inactive',
    tested: 0,
    failed: 0,
    skipped: 0,
    total: 0,
  }
}

const Monospace = styled('strong')({
  fontFamily: 'monospace',
})

const BorderLinearProgress = styled(LinearProgress)(() => ({
  height: 10,
  borderRadius: 5,
}))

function TestingCount({
  tested,
  unskipped,
  hasTotal,
  generatingBuilds,
}: {
  tested: number
  unskipped: number
  hasTotal: boolean
  generatingBuilds: boolean
}) {
  const unskippedString = useMemo(
    () => (
      <>
        /<Monospace>{unskipped.toLocaleString()}</Monospace>
      </>
    ),
    [unskipped]
  )
  return (
    <>
      <Monospace>{tested.toLocaleString()}</Monospace>
      {generatingBuilds && hasTotal && unskippedString}
    </>
  )
}

function SkippedString({ skipped }: { skipped: number }) {
  return <Monospace>{skipped.toLocaleString()}</Monospace>
}

function CharNameBold({
  characterKey,
  gender,
}: {
  characterKey: CharacterKey
  gender: GenderKey
}) {
  return (
    <b>
      <CharacterName characterKey={characterKey} gender={gender} />
    </b>
  )
}

export function BuildAlert({
  status: { type, tested, failed: _, skipped, total, startTime, finishTime },
  characterKey,
  gender,
}: {
  status: BuildStatus
  characterKey: CharacterKey
  gender: GenderKey
}) {
  const { t } = useTranslation('page_character', {
    keyPrefix: 'tabTheorycraft',
  })

  const hasTotal = isFinite(total)

  const generatingBuilds = type !== 'inactive'
  const unskipped = total - skipped

  const skippedText = useMemo(
    () =>
      !!skipped && (
        <Trans t={t} i18nKey={'buildAlert.skipped'}>
          (<SkippedString skipped={skipped} /> skipped)
        </Trans>
      ),
    [skipped, t]
  )

  const durationString = (
    <Monospace>
      {timeStringMs(
        Math.round((finishTime ?? performance.now()) - (startTime ?? NaN))
      )}
    </Monospace>
  )

  const color = 'success' as 'success' | 'warning' | 'error'
  let title = '' as ReactNode
  let subtitle = '' as ReactNode
  let progress = undefined as undefined | number

  if (generatingBuilds) {
    progress = (tested * 100) / unskipped
    title = (
      <Typography>
        <Trans t={t} i18nKey={'buildAlert.running'}>
          Generating and testing{' '}
          <TestingCount
            tested={tested}
            unskipped={unskipped}
            hasTotal={hasTotal}
            generatingBuilds={generatingBuilds}
          />{' '}
          build configurations against the criteria for{' '}
          <CharNameBold characterKey={characterKey} gender={gender} />.
        </Trans>{' '}
        {skippedText}
      </Typography>
    )
    subtitle = (
      <Typography>
        {t`buildAlert.elapsed`}
        {durationString}
      </Typography>
    )
  } else if (tested + skipped) {
    progress = 100
    title = (
      <Typography>
        <Trans t={t} i18nKey={'buildAlert.finished'}>
          Generated and tested{' '}
          <TestingCount
            tested={tested}
            unskipped={unskipped}
            hasTotal={hasTotal}
            generatingBuilds={generatingBuilds}
          />{' '}
          Build configurations against the criteria for{' '}
          <CharNameBold characterKey={characterKey} gender={gender} />.
        </Trans>{' '}
        {skippedText}
      </Typography>
    )
    subtitle = (
      <Typography>
        {t`buildAlert.duration`}
        {durationString}
      </Typography>
    )
  } else {
    return null
  }

  return (
    <Alert
      severity={color}
      variant="filled"
      sx={{
        '& .MuiAlert-message': {
          flexGrow: 1,
        },
      }}
    >
      {title}
      {subtitle}
      {progress !== undefined && (
        <Grid container spacing={1} alignItems="center">
          {hasTotal && (
            <Grid item>
              <Typography>{`${progress.toFixed(1)}%`}</Typography>
            </Grid>
          )}
          <Grid item flexGrow={1}>
            <BorderLinearProgress
              variant={hasTotal ? 'determinate' : 'indeterminate'}
              value={progress}
              color="primary"
            />
          </Grid>
        </Grid>
      )}
    </Alert>
  )
}
