import { timeStringMs } from '@genshin-optimizer/common/util'
import { Alert, Grid, LinearProgress, styled, Typography } from '@mui/material'
import { useMemo, type ReactNode } from 'react'
import { Trans, useTranslation } from 'react-i18next'

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

function CharNameBold({ characterName }: { characterName: ReactNode }) {
  return <b>{characterName}</b>
}

export default function BuildAlert({
  status: { type, tested, failed: _, skipped, total, startTime, finishTime },
  characterName,
}: {
  status: BuildStatus
  characterName: ReactNode
}) {
  const { t } = useTranslation('page_character_optimize')
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
          <CharNameBold characterName={characterName} />.
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
          <CharNameBold characterName={characterName} />.
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
