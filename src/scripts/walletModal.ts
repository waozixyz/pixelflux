const showWalletModal = (message?: string) => {
  const walletModal = document.getElementById('wallet-modal');
  const modalMessage = document.getElementById('modal-message');
  if (walletModal && modalMessage) {
    if (message) {
      modalMessage.textContent = message;
    } else {
      modalMessage.textContent = '';
    }
    walletModal.style.display = 'block';
  }
};

const hideWalletModal = () => {
  const walletModal = document.getElementById('wallet-modal');
  if (walletModal) {
    walletModal.style.display = 'none';
  }
}

export { showWalletModal, hideWalletModal }