import { setupCanvas } from './canvas';
import { setupColorOptions, setupHistory } from './sidebar';
import { Contract, BrowserProvider } from 'ethers';
import Pixelflux1JSON from '../../build/contracts/Pixelflux1.json';

document.addEventListener("DOMContentLoaded", async () => {

    if (typeof window.ethereum !== 'undefined' && window.ethereum.isConnected()) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
            const provider: BrowserProvider = new BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            
            const contractABI = Pixelflux1JSON.abi;
            const contractAddress = "0xE4eB7603a1f9BC2a90475B2999f65115cFA5c397";
            const contract = new Contract(contractAddress, contractABI, signer);

            try {

                // const [baseValue, color, layersLength] = await contract.getCellState(5,3);
                // console.log(baseValue.toString(), color, layersLength.toString());
                const allCells = await contract.getAllCellStates();
                try {
                    const canvas = setupCanvas("polygon", allCells);
                    setupColorOptions(canvas);
                    setupHistory();
                } catch (error) {
                    console.error("Error setting up canvas:", error);
                }

            } catch (error) {
                console.error("Error calling getCellState:", error);
            }
        }
    }
});
