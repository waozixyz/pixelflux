import { Contract, BrowserProvider } from 'ethers';

export function getProvider(): BrowserProvider {
  return new BrowserProvider(window.ethereum);
}
