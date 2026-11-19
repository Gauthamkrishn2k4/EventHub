/** Rounds to 2 decimals, avoiding floating point drift (e.g. 0.1 * 3). */
export const roundMoney = (value) => Math.round((value + Number.EPSILON) * 100) / 100;
