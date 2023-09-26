
const fromGweiToMatic = (value: bigint) => {
  return Number(value) / 10**9;
}
const fromWeiToMatic = (value: number) => {
  return Number(value) / 10**18;
}

const fromMaticToWei = (value: number) => {
  return Number(value) * 10**18;
}


const convertToFullHex = (hex: string): string  => {
  if (hex.length === 4) { 
    const r = hex[1];
    const g = hex[2];
    const b = hex[3];
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  return hex;
}


const roundToTwoSignificantFigures = (num: number): number => {
  if (num === 0) {
      return 0;
  }

  const magnitude = Math.floor(Math.log10(Math.abs(num)));
  const scale = Math.pow(10, magnitude - 1);
  return parseFloat((Math.round(num / scale) * scale).toPrecision(2));
}

export { fromGweiToMatic, fromWeiToMatic, fromMaticToWei, convertToFullHex, roundToTwoSignificantFigures}