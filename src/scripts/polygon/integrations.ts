import { Contract, BrowserProvider } from 'ethers';
import { Stage } from './interfaces';
import contractConfig from '../../config/contracts.json';
import { getProvider, contractABIs } from './blockchainProvider';
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
  
  const stages = [];
  const totalValues = [];

  const loading = document.getElementById('loading')
  const progressBar = document.getElementById('progress-bar')
  const progressFill = progressBar.querySelector('.progress-fill') as HTMLElement;
  const loadingText = document.getElementById('loading-text');

  loading.style.display = "block"

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

    const progressPercentage = ((index + 1) / contractAddresses.length) * 100;
    progressFill.style.width = `${progressPercentage}%`;
    loadingText.textContent = `Loading stage ${index + 1} of ${contractAddresses.length}...`;


    stages.push(stageData);
  }

  loading.style.display = "none"
  
  return {
    stages: stages,
    totalValues: totalValues
  };

}

export { getStagesFromContracts, getTotalValueForContract, getConnectedPolygonAccounts }