/**
 * Utilitaire pour afficher des notifications toast
 * Gère l'affichage temporaire de messages avec différents types
 */

/**
 * Affiche une notification toast
 * @param {string} message - Message à afficher
 * @param {string} type - Type de toast ('success', 'error', 'warning', 'info')
 * @param {number} duration - Durée d'affichage en millisecondes (défaut: 3000)
 */
function showToast(message, type = 'info', duration = 3000) {
  const toast = document.createElement('div');
  toast.className = 'toast toast-top toast-end z-50';
  
  const alertClass = {
    success: 'alert-success',
    error: 'alert-error', 
    warning: 'alert-warning',
    info: 'alert-info'
  }[type] || 'alert-info';

  toast.innerHTML = `
    <div class="alert ${alertClass}">
      <span>${message}</span>
    </div>
  `;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    if (toast.parentNode) {
      toast.remove();
    }
  }, duration);
}

/**
 * Composant Loading Spinner réutilisable
 */
function LoadingSpinner({ message = 'Chargement...' }) {
  return React.createElement('div', { className: 'min-h-screen flex items-center justify-center' },
    React.createElement('div', { className: 'text-center' },
      React.createElement('span', { className: 'loading loading-spinner loading-lg text-primary' }),
      React.createElement('p', { className: 'text-white mt-4 text-lg' }, message)
    )
  );
}

/**
 * Composant Empty State réutilisable
 */
function EmptyState({ icon = '📭', title, subtitle, action }) {
  return React.createElement('div', { className: 'text-center py-16' },
    React.createElement('div', { className: 'text-6xl mb-4' }, icon),
    React.createElement('p', { className: 'text-base-content/50 text-lg mb-2' }, title),
    subtitle && React.createElement('p', { className: 'text-base-content/30 text-sm mb-4' }, subtitle),
    action && action
  );
}

// Export pour utilisation dans d'autres composants
window.Utils = { showToast, LoadingSpinner, EmptyState };