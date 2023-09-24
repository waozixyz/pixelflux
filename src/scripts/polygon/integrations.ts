import { Contract, BrowserProvider } from 'ethers';
import contractConfig from '../../config/contracts.json';
import Pixelflux1JSON from '../../../build/contracts/Pixelflux1.json';

export async function getConnectedPolygonAccounts() {
  if (typeof window.ethereum !== 'undefined' && window.ethereum.isConnected()) {
    return await window.ethereum.request({ method: 'eth_accounts' });
  }
  return [];
}

export async function getStagesFromContracts() {
  const accounts = await getConnectedPolygonAccounts();
  if (accounts.length === 0) return [];

  const provider: BrowserProvider = new BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const { Pixelflux1, Pixelflux2, Pixelflux3 } = contractConfig.polygon;
  const contractABI = Pixelflux1JSON.abi;
  
  const stages = [];
  for (const address of [Pixelflux1, Pixelflux2, Pixelflux3]) {
    const contract = new Contract(address, contractABI, signer);
    const allCells = await contract.getAllCellStates();
    stages.push(allCells);
  }

  return stages;
}
