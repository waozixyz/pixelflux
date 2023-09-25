
export function fromGweiToMatic(value: bigint) {
  return Number(value) / 10**9;
}

export function fromMaticToWei(value: number) {
  return Number(value) * 10**18;
}


export function convertToFullHex(hex: string): string {
  if (hex.length === 4) {  // Check if it's in the short format #RGB
    const r = hex[1];
    const g = hex[2];
    const b = hex[3];
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  return hex;
}
