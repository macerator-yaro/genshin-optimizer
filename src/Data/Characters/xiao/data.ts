import { IFormulaSheet } from "../../../Types/character"
import { basicDMGFormula } from "../../../Util/FormulaUtil"

export const data = {
  normal: {
    hitArr: [
      [27.54, 29.42, 31.3, 33.8, 35.68, 37.87, 40.69, 43.51, 46.32, 49.14, 51.96, 54.78, 57.59, 60.41, 63.23],//1 hits twice
      [56.94, 60.82, 64.7, 69.88, 73.76, 78.29, 84.11, 89.93, 95.76, 101.58, 107.4, 113.23, 119.05, 124.87, 130.69],//2
      [68.55, 73.23, 77.9, 84.13, 88.81, 94.26, 101.27, 108.28, 115.29, 122.3, 129.31, 136.33, 143.34, 150.35, 157.36],//3
      [37.66, 40.23, 42.8, 46.22, 48.79, 51.79, 55.64, 59.49, 63.34, 67.2, 71.05, 74.9, 78.75, 82.6, 86.46],//4 hits twice
      [71.54, 76.42, 81.3, 87.8, 92.68, 98.37, 105.69, 113.01, 120.32, 127.64, 134.96, 142.28, 149.59, 156.91, 164.23],
      [95.83, 102.37, 108.9, 117.61, 124.15, 131.77, 141.57, 151.37, 161.17, 170.97, 180.77, 190.58, 200.38, 210.18, 219.98],
    ]
  },
  charged: {
    dmg: [121.09, 129.34, 137.6, 148.61, 156.86, 166.5, 178.88, 191.26, 203.65, 216.03, 228.42, 240.8, 253.18, 265.57, 277.95],
  },
  plunging: {
    dmg: [81.83, 88.49, 95.16, 104.67, 111.33, 118.94, 129.41, 139.88, 150.35, 161.76, 173.18, 184.6, 196.02, 207.44, 218.86],
    low: [163.63, 176.95, 190.27, 209.3, 222.62, 237.84, 258.77, 279.7, 300.63, 323.46, 346.29, 369.12, 391.96, 414.79, 437.62],
    high: [204.39, 221.02, 237.66, 261.42, 278.06, 297.07, 323.21, 349.36, 375.5, 404.02, 432.54, 461.06, 489.57, 518.09, 546.61],
  },
  skill: {
    hit: [252.8, 271.76, 290.72, 316, 334.96, 353.92, 379.2, 404.48, 429.76, 455.04, 480.32, 505.6, 537.2, 568.8, 600.4],
  },
  burst: {
    atk_bonus: [58.45, 61.95, 65.45, 70, 73.5, 77, 81.55, 86.1, 90.65, 95.2, 99.75, 104.3, 108.85, 113.4, 117.95],
    drain: [3, 3, 3, 2.5, 2.5, 2.5, 2, 2, 2, 2, 2, 2, 2, 2, 2],
  }
}
const formula: IFormulaSheet = {
  normal: Object.fromEntries(data.normal.hitArr.map((arr, i) =>
    [i, stats => basicDMGFormula(arr[stats.tlvl.auto] * ((i === 0 || i === 3) ? 2 : 1), stats, "normal")])),
  charged: Object.fromEntries(Object.entries(data.charged).map(([name, arr]) =>
    [name, stats => basicDMGFormula(arr[stats.tlvl.auto], stats, "charged")])),
  plunging: Object.fromEntries(Object.entries(data.plunging).map(([name, arr]) =>
    [name, stats => basicDMGFormula(arr[stats.tlvl.auto], stats, "plunging")])),
  skill: Object.fromEntries(Object.entries(data.skill).map(([name, arr]) =>
    [name, stats => basicDMGFormula(arr[stats.tlvl.skill], stats, "skill")])),
  burst: {}
}

export default formula
