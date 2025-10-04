// Vue principale des dépenses
function ExpensesView({ user, token }) {
  const [expenses, setExpenses] = useState([]);
  const [familyExpenses, setFamilyExpenses] = useState([]);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [familyPermissions, setFamilyPermissions] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [viewMode, setViewMode] = useState('personal'); // 'personal' ou 'family'
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [loading, setLoading] = useState(true);

  const headers = useMemo(() => ({
    Authorization: 'Bearer ' + token,
    'Content-Type': 'application/json'
  }), [token]);

  // Charger les données au démarrage
  useEffect(() => {
    Promise.all([
      fetchExpenses(),
      fetchFamilyData()
    ]).finally(() => setLoading(false));
  }, []);

  async function fetchExpenses() {
    try {
      const res = await fetch('/api/expenses', { headers });
      if (res.ok) {
        const data = await res.json();
        setExpenses(data.sort((a, b) => new Date(b.date) - new Date(a.date)));
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  }

  async function fetchFamilyData() {
    try {
      const [expensesRes, membersRes, detailsRes] = await Promise.all([
        fetch('/api/family/expenses', { headers }),
        fetch('/api/family/members', { headers }),
        fetch('/api/family/details', { headers })
      ]);

      if (expensesRes.ok) {
        const expensesData = await expensesRes.json();
        setFamilyExpenses(expensesData.sort((a, b) => new Date(b.date) - new Date(a.date)));
      }

      if (membersRes.ok) {
        const membersData = await membersRes.json();
        setFamilyMembers(membersData);
      }

      if (detailsRes.ok) {
        const detailsData = await detailsRes.json();
        setFamilyPermissions(detailsData.family?.myPermissions || null);
      }
    } catch (error) {
      console.error('Error fetching family data:', error);
    }
  }

  async function saveExpense(formData) {
    try {
      const method = editingExpense ? 'PUT' : 'POST';
      const url = editingExpense ? `/api/expenses/${editingExpense.id || editingExpense._id}` : '/api/expenses';

      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Erreur lors de la sauvegarde');
      }

      // Recharger les données
      await Promise.all([fetchExpenses(), fetchFamilyData()]);

      setShowModal(false);
      setEditingExpense(null);

      showToast('✅ Dépense sauvegardée avec succès!', 'success');
    } catch (error) {
      showToast(`❌ ${error.message}`, 'error');
    }
  }

  async function deleteExpense(id) {
    if (!confirm('Supprimer cette dépense ?')) return;

    try {
      const res = await fetch(`/api/expenses/${id}`, {
        method: 'DELETE',
        headers
      });

      if (!res.ok) throw new Error('Erreur lors de la suppression');

      await Promise.all([fetchExpenses(), fetchFamilyData()]);
      showToast('🗑️ Dépense supprimée', 'warning');
    } catch (error) {
      showToast(`❌ ${error.message}`, 'error');
    }
  }

  function openEditModal(expense) {
    setEditingExpense(expense);
    setShowModal(true);
  }

  // Fonction pour vérifier si l'utilisateur peut éditer une dépense
  function canEditExpense(expense) {
    if (viewMode === 'personal') {
      // Mode personnel : peut toujours éditer ses propres dépenses
      return true;
    }

    if (viewMode === 'family' && familyPermissions) {
      // Si l'utilisateur a la permission d'éditer toutes les dépenses
      if (familyPermissions.canEditAllExpenses) {
        return true;
      }
      // Si l'utilisateur peut éditer ses propres dépenses et c'est sa dépense
      if (familyPermissions.canEditOwnExpenses && expense.username === user.username) {
        return true;
      }
    }

    return false;
  }

  function showToast(message, type) {
    const toast = document.createElement('div');
    toast.className = 'toast toast-top toast-end';
    const alertClass = type === 'success' ? 'alert-success' : type === 'error' ? 'alert-error' : 'alert-warning';
    toast.innerHTML = `<div class="alert ${alertClass}"><span>${message}</span></div>`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  // Déterminer les dépenses à afficher
  const currentExpenses = viewMode === 'family' ? familyExpenses : expenses;

  // Filtrer les dépenses
  const filteredExpenses = currentExpenses.filter(expense =>
    expense.description.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (!filterCategory || expense.category === filterCategory)
  );

  // Calculs des statistiques
  const total = currentExpenses.reduce((sum, e) => sum + e.amount, 0);
  const thisMonth = currentExpenses.filter(e =>
    new Date(e.date).getMonth() === new Date().getMonth() &&
    new Date(e.date).getFullYear() === new Date().getFullYear()
  );
  const monthlyTotal = thisMonth.reduce((sum, e) => sum + e.amount, 0);
  const avgPerExpense = currentExpenses.length ? total / currentExpenses.length : 0;

  if (loading) {
    return React.createElement('div', { className: 'flex justify-center items-center h-64' },
      React.createElement('span', { className: 'loading loading-spinner loading-lg text-primary' })
    );
  }

  return React.createElement('div', { className: 'container mx-auto p-6 max-w-7xl animate-fade-in-up' },
    // Header avec basculement de vue
    React.createElement('div', { className: 'flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8' },
      React.createElement('div', null,
        React.createElement('h1', { className: 'text-3xl font-bold text-white mb-2' },
          viewMode === 'family' ? '👨‍👩‍👧‍👦 Dépenses Familiales' : '💰 Mes Dépenses'
        ),
        React.createElement('p', { className: 'text-base-content/70' },
          `Gestion de vos finances ${viewMode === 'family' ? 'familiales' : 'personnelles'}`
        )
      ),

      React.createElement('div', { className: 'flex gap-3 mt-4 lg:mt-0' },
        React.createElement('div', { className: 'join' },
          React.createElement('button', {
            onClick: () => setViewMode('personal'),
            className: `btn join-item ${viewMode === 'personal' ? 'btn-primary' : 'btn-outline btn-primary'}`
          }, '👤 Personnel'),
          React.createElement('button', {
            onClick: () => setViewMode('family'),
            className: `btn join-item ${viewMode === 'family' ? 'btn-primary' : 'btn-outline btn-primary'}`
          }, '👨‍👩‍👧‍👦 Famille')
        ),

        viewMode === 'personal' && React.createElement('button', {
          onClick: () => setShowModal(true),
          className: 'btn btn-accent gap-2'
        },
          React.createElement('svg', { className: 'w-5 h-5', fill: 'currentColor', viewBox: '0 0 24 24' },
            React.createElement('path', { d: 'M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z' })
          ),
          'Nouvelle Dépense'
        )
      )
    ),

    // Statistiques
    React.createElement('div', { className: 'stats stats-vertical lg:stats-horizontal shadow glass-effect mb-8 w-full' },
      React.createElement(StatsCard, {
        title: 'Total général',
        value: fmt(total),
        icon: '💰',
        description: `${currentExpenses.length} dépense${currentExpenses.length > 1 ? 's' : ''}`
      }),
      React.createElement(StatsCard, {
        title: 'Ce mois',
        value: fmt(monthlyTotal),
        icon: '📅',
        description: `${thisMonth.length} dépense${thisMonth.length > 1 ? 's' : ''}`
      }),
      React.createElement(StatsCard, {
        title: 'Moyenne/dépense',
        value: fmt(avgPerExpense),
        icon: '📊',
        description: 'Dépense moyenne'
      })
    ),

    // Graphique et informations familiales
    React.createElement('div', { className: 'grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8' },
      // Graphique
      React.createElement('div', { className: 'lg:col-span-2' },
        React.createElement('div', { className: 'card bg-base-100/20 shadow-xl glass-effect' },
          React.createElement('div', { className: 'card-body' },
            React.createElement('h3', { className: 'card-title text-white mb-4' },
              `📈 Répartition par catégorie ${viewMode === 'family' ? '(Famille)' : '(Personnel)'}`
            ),
            React.createElement(CategoryChart, { expenses: currentExpenses })
          )
        )
      ),

      // Informations familiales
      viewMode === 'family' && familyMembers.length > 0 && React.createElement('div', null,
        React.createElement('div', { className: 'card bg-base-100/20 shadow-xl glass-effect' },
          React.createElement('div', { className: 'card-body' },
            React.createElement('h3', { className: 'card-title text-white mb-4' }, '👥 Membres de la famille'),
            React.createElement('div', { className: 'space-y-3' },
              ...familyMembers.map(member =>
                React.createElement('div', { key: member.id, className: 'flex items-center gap-3' },
                  React.createElement('div', { className: 'avatar placeholder' },
                    React.createElement('div', { className: 'bg-primary text-primary-content rounded-full w-8' },
                      React.createElement('span', { className: 'text-xs font-bold' },
                        member.username.charAt(0).toUpperCase()
                      )
                    )
                  ),
                  React.createElement('div', null,
                    React.createElement('div', { className: 'text-white font-medium' }, member.username),
                    React.createElement('div', { className: 'text-xs text-base-content/50 capitalize' }, member.role)
                  )
                )
              )
            )
          )
        )
      )
    ),

    // Filtres et recherche
    React.createElement('div', { className: 'card bg-base-100/20 shadow-xl glass-effect mb-6' },
      React.createElement('div', { className: 'card-body' },
        React.createElement('div', { className: 'flex flex-col lg:flex-row gap-4' },
          React.createElement('div', { className: 'flex-1' },
            React.createElement('input', {
              type: 'text',
              value: searchQuery,
              onChange: e => setSearchQuery(e.target.value),
              className: 'input input-bordered w-full',
              placeholder: '🔍 Rechercher une dépense...'
            })
          ),
          React.createElement('div', null,
            React.createElement('select', {
              value: filterCategory,
              onChange: e => setFilterCategory(e.target.value),
              className: 'select select-bordered w-full lg:w-48'
            },
              React.createElement('option', { value: '' }, 'Toutes les catégories'),
              ...CATEGORIES.map(cat =>
                React.createElement('option', { key: cat, value: cat }, cat)
              )
            )
          )
        )
      )
    ),

    // Liste des dépenses
    React.createElement('div', { className: 'card bg-base-100/20 shadow-xl glass-effect' },
      React.createElement('div', { className: 'card-body' },
        React.createElement('h3', { className: 'card-title text-white mb-4' },
          `🧾 ${filteredExpenses.length} dépense${filteredExpenses.length > 1 ? 's' : ''} trouvée${filteredExpenses.length > 1 ? 's' : ''}`
        ),

        filteredExpenses.length === 0
          ? React.createElement('div', { className: 'text-center py-8' },
            React.createElement('p', { className: 'text-base-content/50 text-lg' }, '📭 Aucune dépense trouvée'),
            React.createElement('p', { className: 'text-base-content/30 text-sm mt-2' }, 'Modifiez vos filtres ou ajoutez une nouvelle dépense')
          )
          : React.createElement('div', { className: 'space-y-3' },
            ...filteredExpenses.map(expense =>
              React.createElement('div', {
                key: expense.id || expense._id,
                className: 'flex items-center justify-between p-4 bg-base-100/10 rounded-lg hover:bg-base-100/20 transition-colors'
              },
                React.createElement('div', { className: 'flex items-center gap-4 flex-1' },
                  React.createElement('div', {
                    className: 'w-3 h-3 rounded-full',
                    style: { backgroundColor: CATEGORY_COLORS[expense.category] }
                  }),
                  React.createElement('div', { className: 'flex-1' },
                    React.createElement('div', { className: 'text-white font-medium' }, expense.description),
                    React.createElement('div', { className: 'text-sm text-base-content/50 flex items-center gap-2' },
                      React.createElement('span', null, expense.category),
                      React.createElement('span', null, '•'),
                      React.createElement('span', null, new Date(expense.date).toLocaleDateString('fr-FR')),
                      viewMode === 'family' && expense.username && React.createElement('span', null, `• par ${expense.username}`)
                    )
                  )
                ),
                React.createElement('div', { className: 'flex items-center gap-3' },
                  React.createElement('div', { className: 'text-lg font-bold text-primary' }, fmt(expense.amount)),
                  canEditExpense(expense) && React.createElement('div', { className: 'flex gap-1' },
                    React.createElement('button', {
                      onClick: () => openEditModal(expense),
                      className: 'btn btn-ghost btn-sm btn-square'
                    }, '✏️'),
                    React.createElement('button', {
                      onClick: () => deleteExpense(expense.id || expense._id),
                      className: 'btn btn-ghost btn-sm btn-square text-error'
                    }, '🗑️')
                  )
                )
              )
            )
          )
      )
    ),

    // Modal d'ajout/édition
    showModal && React.createElement(ExpenseModal, {
      expense: editingExpense,
      onSave: saveExpense,
      onClose: () => {
        setShowModal(false);
        setEditingExpense(null);
      }
    })
  );
}