import { WeaponData } from 'pipeline'
import { getTalentStatKey, getTalentStatKeyVariant } from '../../../../Build/Build'
import { TransWrapper } from '../../../../Components/Translate'
import Stat from '../../../../Stat'
import { IWeaponSheet } from '../../../../Types/weapon'
import formula, { data } from './data'
import data_gen from './data_gen.json'
import img from './Weapon_Fillet_Blade.png'
const cds = [15, 14, 13, 12, 11]
const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  img,
  document: [{
    fields: [{
      text: <TransWrapper ns="sheet" key18="dmg" />,
      formulaText: stats => <span>{data.dmg[stats.weapon.refineIndex]}% {Stat.printStat(getTalentStatKey("physical", stats), stats)}</span>,
      formula: formula.dmg,
      variant: stats => getTalentStatKeyVariant("physical", stats),
    }, {
      text: "CD",
      value: stats => `${cds[stats.weapon.refineIndex]}s`
    }]
  }]
}
export default weapon