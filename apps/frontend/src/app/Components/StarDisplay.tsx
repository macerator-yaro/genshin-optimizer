import type { RarityKey } from '@genshin-optimizer/gi/consts'
import StarRoundedIcon from '@mui/icons-material/StarRounded'
import ColorText from './ColoredText'

/**
 * @deprecated use `StarsDisplay` in `@genshin-optimizer/common/ui`
 */
export const StarsDisplay = ({
  stars = 1,
  colored = false,
  inline = false,
}: {
  stars?: RarityKey
  colored?: boolean
  inline?: boolean
}) => (
  <ColorText color={colored ? 'warning' : undefined}>
    {[...Array(stars).keys()].map((_, i) => (
      <StarRoundedIcon
        key={i}
        fontSize={inline ? 'inherit' : undefined}
        sx={inline ? { verticalAlign: 'text-top' } : undefined}
      />
    ))}
  </ColorText>
)
