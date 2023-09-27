import { Contract, BrowserProvider } from 'ethers';
import { Stage } from './interfaces';
import contractConfig from '../../config/contracts.json';
import { getProvider } from './blockchainProvider';
import { updateCanvasCell, recreateCanvasForContractEnabled } from './canvas/utility';
import Pixelflux1JSON from '../../../build/contracts/Pixelflux1.json';
import Pixelflux2JSON from '../../../build/contracts/Pixelflux2.json';
import Pixelflux3JSON from '../../../build/contracts/Pixelflux3.json';

const contractABIs = [Pixelflux1JSON.abi, Pixelflux2JSON.abi, Pixelflux3JSON.abi];

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
  
  const stages = [];
  const totalValues = [];


  for (const [index, address] of contractAddresses.entries()) {
    const contract = new Contract(address, contractABIs[index], provider);
    
    contract.on('LayerPurchased', async(buyer, x, y, numLayers, color) => {
      const updatedTotalValue = await getTotalValueForContract(address, contractABIs[index], provider);
      totalValues[index] = updatedTotalValue;
      updateCanvasCell(buyer, Number(x), Number(y), Number(numLayers), color, index, totalValues)
    });

    if (index !== 0) {
      contract.on('ContractEnabled', () => {
        recreateCanvasForContractEnabled()
      })
    }

    const isEnabled = await contract.isContractEnabled();
    const stageData = {
      isEnabled: isEnabled,
      cells: isEnabled ? await contract.getAllCellStates() : []
    };

    const totalValue = await getTotalValueForContract(address, contractABIs[index], provider);
    totalValues.push(totalValue);

    stages.push(stageData);
  }

  return {
    stages: stages,
    totalValues: totalValues
  };

}

export { getStagesFromContracts, getTotalValueForContract, getConnectedPolygonAccounts }