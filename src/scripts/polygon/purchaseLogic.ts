import { Contract } from 'ethers';
import Pixelflux1JSON from '../../../build/contracts/Pixelflux1.json';
import { getProvider } from './blockchainProvider';
import { store } from './store';
import contractConfig from '../../config/contracts.json';
import { showNotification } from '../notification';
import { fromMaticToWei } from './utils';

const gasLimit = 500000;



const buyLayers = async(provider: any, userAddress: string, contractAddress: string, x: number, y: number, numLayersToAdd: number, color: string) => {
  try {
    const signer = await provider.getSigner(userAddress);
    const contract = new Contract(contractAddress, Pixelflux1JSON.abi, signer);

    const baseValueInWei = fromMaticToWei(store.selectedSquare.squareValue);
    const totalValueToSend = baseValueInWei * numLayersToAdd;
    console.log(totalValueToSend, numLayersToAdd)
    if (numLayersToAdd === 1) {
      //const gasEstimate = await contract.buyLayer.estimateGas([x, y, color]);
      await contract.buyLayer(x, y, color, { value: totalValueToSend.toString(), gasLimit: gasLimit });
    } else {
      //const gasEstimate = await contract.buyMultipleLayers.estimateGas([x, y, numLayersToAdd, color]);
      await contract.buyMultipleLayers(x, y, numLayersToAdd, color, { value: totalValueToSend.toString(), gasLimit: gasLimit });
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


export { handlePurchaseClick }