import { getTalentStatKey, getTalentStatKeyVariant } from '../../../../Build/Build'
import { IWeaponSheet } from '../../../../Types/weapon'
import img from './Weapon_The_Flute.png'
import formula, { data } from './data'
import { TransWrapper } from '../../../../Components/Translate'
import Stat from '../../../../Stat'
import data_gen from './data_gen.json'
import { WeaponData } from 'pipeline'
const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  img,
  document: [{
    fields: [{
      text: <TransWrapper ns="sheet" key18="dmg" />,
      formulaText: stats => <span>{data.vals[stats.weapon.refineIndex]}% {Stat.printStat(getTalentStatKey("physical", stats), stats)}</span>,
      formula: formula.dmg,
      variant: stats => getTalentStatKeyVariant("physical", stats),
    }]
  }]
}
export default weapon