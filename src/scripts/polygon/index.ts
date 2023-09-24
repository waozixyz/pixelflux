import { setupCanvas } from './canvasUtils';
import { setupColorOptions, setupHistory } from './sidebar';
import { getStagesFromContracts } from './integrations';

document.addEventListener("DOMContentLoaded", async () => {
  const loadingAnimation = document.getElementById('loading-animation');
  loadingAnimation.style.display = 'block';

  const stages = await getStagesFromContracts();

  loadingAnimation.style.display = 'none';

  if (stages.length > 0) {
    try {
      const canvas = setupCanvas("polygon", stages);
      setupColorOptions(canvas);
    } catch (error) {
      console.error("Error setting up canvas:", error);
    }
  }
});
