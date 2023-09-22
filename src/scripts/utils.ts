export function roundToTwoSigFigs(value: number): number {
  if (value === 0) return 0;

  const magnitude = Math.floor(Math.log10(Math.abs(value)));
  const scale = Math.pow(10, magnitude - 1);
  let result = Math.round(value / scale) * scale;

  return Math.round(result * 1e10) / 1e10;
}

