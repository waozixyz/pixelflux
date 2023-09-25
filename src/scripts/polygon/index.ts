import { setupCanvas } from './canvasUtils';
import { setupColorOptions } from './sidebar';
import { getStagesFromContracts } from './integrations';

document.addEventListener("DOMContentLoaded", async () => {
  const loadingAnimation = document.getElementById('loading-animation');
  loadingAnimation.style.display = 'block';

  const { stages, totalValues } = await getStagesFromContracts();

  loadingAnimation.style.display = 'none';

  if (stages && stages.length > 0) {
    const canvas = setupCanvas("polygon", stages, totalValues);
    setupColorOptions(canvas);
  }
});
