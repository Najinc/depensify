// Vue d'administration
function AdminView({ user, token }) {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPendingUsers();
  }, []);

  async function loadPendingUsers() {
    try {
      const response = await fetch('/api/admin/pending-users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const users = await response.json();
        setPendingUsers(users);
      }
    } catch (error) {
      console.error('Error loading pending users:', error);
    } finally {
      setLoading(false);
    }
  }

  async function approveUser(userId) {
    try {
      const response = await fetch(`/api/admin/approve-user/${userId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        await loadPendingUsers();
        showToast('✅ Utilisateur approuvé avec succès!', 'success');
      }
    } catch (error) {
      console.error('Error approving user:', error);
      showToast('❌ Erreur lors de l\'approbation', 'error');
    }
  }

  async function rejectUser(userId) {
    const reason = prompt('Raison du rejet (optionnel):');
    try {
      const response = await fetch(`/api/admin/reject-user/${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });
      if (response.ok) {
        await loadPendingUsers();
        showToast('⚠️ Utilisateur rejeté', 'warning');
      }
    } catch (error) {
      console.error('Error rejecting user:', error);
      showToast('❌ Erreur lors du rejet', 'error');
    }
  }

  function showToast(message, type) {
    const toast = document.createElement('div');
    toast.className = 'toast toast-top toast-end';
    const alertClass = type === 'success' ? 'alert-success' : type === 'error' ? 'alert-error' : 'alert-warning';
    toast.innerHTML = `<div class="alert ${alertClass}"><span>${message}</span></div>`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  if (loading) {
    return React.createElement('div', { className: 'flex justify-center items-center h-64' },
      React.createElement('span', { className: 'loading loading-spinner loading-lg text-primary' })
    );
  }

  return React.createElement('div', { className: 'container mx-auto p-6 max-w-6xl animate-fade-in-up' },
    // Header Admin
    React.createElement('div', { className: 'text-center mb-8' },
      React.createElement('h1', { className: 'text-4xl font-bold text-white mb-2' }, '🔐 Administration'),
      React.createElement('p', { className: 'text-base-content/70' }, 'Gestion des comptes utilisateurs')
    ),

    // Stats
    React.createElement('div', { className: 'stats stats-vertical lg:stats-horizontal shadow glass-effect mb-8 w-full' },
      React.createElement(StatsCard, {
        title: 'Demandes en attente',
        value: pendingUsers.length.toString(),
        icon: '👥',
        description: 'Comptes à valider'
      })
    ),

    // Liste des utilisateurs en attente
    pendingUsers.length === 0
      ? React.createElement('div', { className: 'hero bg-base-100/20 rounded-box glass-effect' },
        React.createElement('div', { className: 'hero-content text-center' },
          React.createElement('div', { className: 'max-w-md' },
            React.createElement('h2', { className: 'text-2xl font-bold text-success mb-4' }, '✅ Tout est à jour!'),
            React.createElement('p', { className: 'text-base-content/70' }, 'Aucune demande de compte en attente')
          )
        )
      )
      : React.createElement('div', { className: 'space-y-4' },
        React.createElement('h2', { className: 'text-2xl font-bold text-white mb-6' }, '👥 Demandes de comptes'),
        ...pendingUsers.map(pendingUser =>
          React.createElement('div', {
            key: pendingUser._id,
            className: 'card bg-base-100/20 shadow-xl glass-effect hover:bg-base-100/30 transition-all duration-300'
          },
            React.createElement('div', { className: 'card-body' },
              React.createElement('div', { className: 'flex justify-between items-center' },
                React.createElement('div', { className: 'flex-1' },
                  React.createElement('h3', { className: 'card-title text-white text-xl' },
                    React.createElement('div', { className: 'avatar placeholder' },
                      React.createElement('div', { className: 'bg-primary text-primary-content rounded-full w-12' },
                        React.createElement('span', { className: 'text-lg font-bold' },
                          pendingUser.username.charAt(0).toUpperCase()
                        )
                      )
                    ),
                    pendingUser.username
                  ),
                  React.createElement('p', { className: 'text-base-content/70 mt-2' },
                    `📧 ${pendingUser.email || 'Aucun email fourni'}`
                  ),
                  React.createElement('p', { className: 'text-base-content/50 text-sm mt-1' },
                    `📅 Demande le ${new Date(pendingUser.createdAt).toLocaleDateString('fr-FR')}`
                  )
                ),
                React.createElement('div', { className: 'flex gap-3' },
                  React.createElement('button', {
                    onClick: () => approveUser(pendingUser._id),
                    className: 'btn btn-success btn-sm gap-2'
                  },
                    React.createElement('svg', { width: '16', height: '16', viewBox: '0 0 24 24', fill: 'currentColor' },
                      React.createElement('path', { d: 'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z' })
                    ),
                    'Approuver'
                  ),
                  React.createElement('button', {
                    onClick: () => rejectUser(pendingUser._id),
                    className: 'btn btn-error btn-sm gap-2'
                  },
                    React.createElement('svg', { width: '16', height: '16', viewBox: '0 0 24 24', fill: 'currentColor' },
                      React.createElement('path', { d: 'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z' })
                    ),
                    'Rejeter'
                  )
                )
              )
            )
          )
        )
      )
  );
}