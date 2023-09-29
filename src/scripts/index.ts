import { setupCanvas } from './canvas/setup';
import { getStagesFromContracts } from './integrations';
import { setupSidebar } from './sidebar/setup';
import { showNotification } from './notification';
import { showWalletModal } from './walletModal';

document.addEventListener("DOMContentLoaded", async () => {
  let stages, totalValues

  try {
    ({ stages, totalValues } = await getStagesFromContracts());
  } catch (error) {
    console.log(error)
    if (error.message === 'Failed to get a provider.') {
      showWalletModal();
    } else {
      showNotification("Error fetching data from Polygon mainnet. Please retry later.");
      
    }
  }

  if (stages && stages.length > 0) {
    setupCanvas(stages, totalValues);
    setupSidebar();
  }
});
