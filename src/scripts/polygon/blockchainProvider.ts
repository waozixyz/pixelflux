import { BrowserProvider } from 'ethers';

import Pixelflux1JSON from '../../../build/contracts/Pixelflux1.json';
import Pixelflux2JSON from '../../../build/contracts/Pixelflux2.json';
import Pixelflux3JSON from '../../../build/contracts/Pixelflux3.json';

export function getProvider(): BrowserProvider {
  return new BrowserProvider(window.ethereum);
}
 
export const contractABIs = [Pixelflux1JSON.abi, Pixelflux2JSON.abi, Pixelflux3JSON.abi];
