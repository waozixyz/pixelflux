import { Contract } from 'ethers';
import Pixelflux1JSON from '../../../build/contracts/Pixelflux1.json';
import { getProvider } from './blockchainProvider';
import { store } from './store';
import contractConfig from '../../config/contracts.json';
import { showNotification } from '../notification';
import { fromMaticToWei } from './utils';

const BASE_GAS = 500000;
const GAS_PER_EXISTING_LAYER = 20000;
const GAS_PER_NEW_LAYER = 15000;
const BUFFER_MULTIPLIER = 1.20;

const calculateTotalValueToSend = (numLayersToAdd: number) => {
  const currentLayersCount = store.selectedSquare.squareLayers.length;
  const baseValueInWei = fromMaticToWei(store.selectedSquare.squareValue);
  let sumOfSeries = numLayersToAdd * (2 * currentLayersCount + numLayersToAdd - 1) / 2;
  return baseValueInWei * sumOfSeries;
};


const estimateGas = (numLayersToAdd: number) => {
  const currentLayersCount = store.selectedSquare.squareLayers.length;

  return Math.ceil(
      BASE_GAS + 
      (GAS_PER_EXISTING_LAYER * currentLayersCount) + 
      (GAS_PER_NEW_LAYER * numLayersToAdd)
  ) * BUFFER_MULTIPLIER;
}

const buyLayers = async(provider: any, userAddress: string, contractAddress: string, x: number, y: number, numLayersToAdd: number, color: string) => {
  try {
    const signer = await provider.getSigner(userAddress);
    const contract = new Contract(contractAddress, Pixelflux1JSON.abi, signer);

    const totalValueToSend = calculateTotalValueToSend(numLayersToAdd);

    const estimatedGas = estimateGas(numLayersToAdd);
    if (numLayersToAdd === 1) {
      await contract.buyLayer(x, y, color, { value: totalValueToSend.toString(), gasLimit: estimatedGas });
    } else {
      await contract.buyMultipleLayers(x, y, numLayersToAdd, color, { value: totalValueToSend.toString(), gasLimit: estimatedGas });
    }
  } catch (error) {
    console.error("Contract interaction error:", error);
  }
}

const handlePurchaseClick = async() => {
  const provider = getProvider();
  let userAddress = '';
  if (typeof window.ethereum !== 'undefined') {
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    if (accounts.length > 0) {
      userAddress = accounts[0];
    }
  }

  if (!userAddress) {
    showNotification("No user address found. Please connect to MetaMask.");
    return;
}
  
  const contractAddress = contractConfig.polygon.Pixelflux[store.selectedSquare.stage];  
  const layerSlider = document.getElementById('layer-slider') as HTMLInputElement;
  const numLayersToAdd = parseInt(layerSlider.value);
  const color = (typeof store.selectedSquare.fill === 'string') ? store.selectedSquare.fill : '';
  const x = store.selectedSquare.gridX;
  const y = store.selectedSquare.gridY;
  
  buyLayers(provider, userAddress, contractAddress, x, y, numLayersToAdd, color);
}


export { handlePurchaseClick, calculateTotalValueToSend }