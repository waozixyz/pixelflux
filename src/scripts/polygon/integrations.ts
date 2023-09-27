import { Contract, BrowserProvider } from 'ethers';
import { Stage } from './interfaces';
import contractConfig from '../../config/contracts.json';
import Pixelflux1JSON from '../../../build/contracts/Pixelflux1.json';
import { getProvider } from './blockchainProvider';
import { updateCanvasCell, recreateCanvasForContractEnabled } from './canvas/utility';

const getConnectedPolygonAccounts = async(): Promise<string[]> => {
  if (typeof window.ethereum !== 'undefined' && window.ethereum.isConnected()) {
    return await window.ethereum.request({ method: 'eth_accounts' });
  }
  return [];
}

const getTotalValueForContract = async(address: string, abi: any, provider: BrowserProvider): Promise<number> => {
  const contract = new Contract(address, abi, provider);
  return await contract.calculateTotalValue();
}

type StagesResult = {
  stages: Stage[];
  totalValues: number[];
};


const getStagesFromContracts = async(): Promise<StagesResult> => {
  const provider = getProvider();
  const contractAddresses = contractConfig.polygon.Pixelflux;
  const contractABI = Pixelflux1JSON.abi;
  
  const stages = [];
  const totalValues = [];

  for (const [index, address] of contractAddresses.entries()) {
    const contract = new Contract(address, contractABI, provider);
    
    contract.on('LayerPurchased', async(buyer, x, y, numLayers, color, event) => {
      const updatedTotalValues = await Promise.all(contractAddresses.map(address => getTotalValueForContract(address, Pixelflux1JSON.abi, provider)));
      updateCanvasCell(buyer, Number(x), Number(y), Number(numLayers), color, index, updatedTotalValues)
    });

    contract.on('ContractEnabled', async(event) => {
      recreateCanvasForContractEnabled()
    })

    const isEnabled = await contract.isContractEnabled();
    const stageData = {
      isEnabled: isEnabled,
      cells: isEnabled ? await contract.getAllCellStates() : []
    };
    
    const totalValue = await getTotalValueForContract(address, contractABI, provider);
    totalValues.push(totalValue);

    stages.push(stageData);
  }

  return {
    stages: stages,
    totalValues: totalValues
  };
}


export { getStagesFromContracts, getTotalValueForContract, getConnectedPolygonAccounts }