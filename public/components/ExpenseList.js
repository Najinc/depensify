/**
 * Composants pour l'affichage des dépenses
 */

// Couleurs par catégorie
const CATEGORY_COLORS = {
  'Alimentation': '#22c55e',
  'Transport': '#3b82f6',
  'Restauration': '#f59e0b',
  'Divertissement': '#ec4899',
  'Santé': '#ef4444',
  'Shopping': '#8b5cf6',
  'Éducation': '#06b6d4',
  'Divers': '#6b7280'
};

/**
 * Formate un montant en euros
 */
function formatAmount(amount) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
}

/**
 * Composant individuel pour afficher une dépense
 */
function ExpenseItem({ expense, viewMode, canEdit, onEdit, onDelete }) {
  return React.createElement('div', {
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
      React.createElement('div', { className: 'text-lg font-bold text-primary' }, formatAmount(expense.amount)),
      canEdit && React.createElement('div', { className: 'flex gap-1' },
        React.createElement('button', {
          onClick: () => onEdit(expense),
          className: 'btn btn-ghost btn-sm btn-square',
          title: 'Modifier'
        }, '✏️'),
        React.createElement('button', {
          onClick: () => onDelete(expense.id || expense._id),
          className: 'btn btn-ghost btn-sm btn-square text-error',
          title: 'Supprimer'
        }, '🗑️')
      )
    )
  );
}

/**
 * Composant liste des dépenses avec filtres
 */
function ExpensesList({
  expenses,
  viewMode,
  searchQuery,
  filterCategory,
  familyPermissions,
  user,
  onEdit,
  onDelete
}) {
  // Fonction pour vérifier si l'utilisateur peut éditer une dépense
  function canEditExpense(expense) {
    if (viewMode === 'personal') {
      return true;
    }

    if (viewMode === 'family' && familyPermissions) {
      if (familyPermissions.canEditAllExpenses) {
        return true;
      }
      if (familyPermissions.canEditOwnExpenses && expense.username === user.username) {
        return true;
      }
    }

    return false;
  }

  // Filtrage des dépenses
  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = !searchQuery ||
      expense.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expense.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = !filterCategory || expense.category === filterCategory;

    return matchesSearch && matchesCategory;
  });

  if (filteredExpenses.length === 0) {
    return React.createElement('div', { className: 'text-center py-16' },
      React.createElement('div', { className: 'text-6xl mb-4' }, '📭'),
      React.createElement('p', { className: 'text-base-content/50 text-lg mb-2' }, 'Aucune dépense trouvée'),
      React.createElement('p', { className: 'text-base-content/30 text-sm' }, 'Modifiez vos filtres ou ajoutez une nouvelle dépense')
    );
  }

  return React.createElement('div', { className: 'space-y-3' },
    ...filteredExpenses.map(expense =>
      React.createElement(ExpenseItem, {
        key: expense.id || expense._id,
        expense,
        viewMode,
        canEdit: canEditExpense(expense),
        onEdit,
        onDelete
      })
    )
  );
}

/**
 * Composant barre de recherche et filtres
 */
function ExpenseFilters({ searchQuery, setSearchQuery, filterCategory, setFilterCategory }) {
  const categories = ['Alimentation', 'Transport', 'Restauration', 'Divertissement', 'Santé', 'Shopping', 'Éducation', 'Divers'];

  return React.createElement('div', { className: 'flex flex-col lg:flex-row gap-4 mb-6' },
    React.createElement('div', { className: 'flex-1' },
      React.createElement('input', {
        type: 'text',
        placeholder: '🔍 Rechercher une dépense...',
        className: 'input input-bordered w-full bg-base-100/20 border-base-300/30',
        value: searchQuery,
        onChange: (e) => setSearchQuery(e.target.value)
      })
    ),
    React.createElement('div', { className: 'min-w-48' },
      React.createElement('select', {
        className: 'select select-bordered w-full bg-base-100/20 border-base-300/30',
        value: filterCategory,
        onChange: (e) => setFilterCategory(e.target.value)
      },
        React.createElement('option', { value: '' }, '📂 Toutes les catégories'),
        ...categories.map(cat =>
          React.createElement('option', { key: cat, value: cat }, cat)
        )
      )
    )
  );
}

// Export des composants
window.ExpenseComponents = {
  ExpenseItem,
  ExpensesList,
  ExpenseFilters,
  formatAmount,
  CATEGORY_COLORS
};