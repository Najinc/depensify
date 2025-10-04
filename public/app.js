const { useState, useEffect, useMemo } = React;

function fmt(n) { 
  return Number(n).toLocaleString(undefined, { style: 'currency', currency: 'EUR' }); 
}

const CATEGORIES = ['Alimentation', 'Transport', 'Restauration', 'Divertissement', 'Santé', 'Shopping', 'Éducation', 'Divers'];
const CATEGORY_COLORS = {
  'Alimentation': '#10b981', 'Transport': '#3b82f6', 'Restauration': '#f59e0b',
  'Divertissement': '#8b5cf6', 'Santé': '#ef4444', 'Shopping': '#ec4899',
  'Éducation': '#6366f1', 'Divers': '#6b7280'
};

function LoginForm({ onLogin, onSwitch }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  async function submit(e) {
    e.preventDefault(); 
    setError(null);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onLogin(data.token, data.user);
    } catch (err) {
      setError(err.message);
    }
  }

  return React.createElement('div', { className: 'auth-container' },
    React.createElement('div', { className: 'auth-card' },
      React.createElement('h2', { className: 'auth-title' }, '💰 Depensify'),
      React.createElement('p', { className: 'auth-subtitle' }, 'Gérez vos dépenses facilement'),
      React.createElement('form', { onSubmit: submit, className: 'auth-form' },
        React.createElement('input', {
          type: 'text',
          value: username,
          onChange: e => setUsername(e.target.value),
          placeholder: 'Nom d\'utilisateur',
          required: true,
          className: 'auth-input'
        }),
        React.createElement('input', {
          type: 'password',
          value: password,
          onChange: e => setPassword(e.target.value),
          placeholder: 'Mot de passe',
          required: true,
          className: 'auth-input'
        }),
        React.createElement('button', { type: 'submit', className: 'auth-button' }, 'Se connecter'),
        error && React.createElement('div', { className: 'auth-error' }, error),
        React.createElement('p', { className: 'auth-switch' },
          'Pas de compte ? ',
          React.createElement('button', { 
            type: 'button', 
            onClick: onSwitch,
            className: 'auth-link'
          }, 'S\'inscrire')
        )
      )
    )
  );
}

function RegisterForm({ onRegister, onSwitch }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  async function submit(e) {
    e.preventDefault(); 
    setError(null);
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onRegister(data.token, data.user);
    } catch (err) {
      setError(err.message);
    }
  }

  return React.createElement('div', { className: 'auth-container' },
    React.createElement('div', { className: 'auth-card' },
      React.createElement('h2', { className: 'auth-title' }, '💰 Depensify'),
      React.createElement('p', { className: 'auth-subtitle' }, 'Créez votre compte'),
      React.createElement('form', { onSubmit: submit, className: 'auth-form' },
        React.createElement('input', {
          type: 'text',
          value: username,
          onChange: e => setUsername(e.target.value),
          placeholder: 'Nom d\'utilisateur',
          required: true,
          className: 'auth-input'
        }),
        React.createElement('input', {
          type: 'password',
          value: password,
          onChange: e => setPassword(e.target.value),
          placeholder: 'Mot de passe',
          required: true,
          className: 'auth-input'
        }),
        React.createElement('button', { type: 'submit', className: 'auth-button' }, 'S\'inscrire'),
        error && React.createElement('div', { className: 'auth-error' }, error),
        React.createElement('p', { className: 'auth-switch' },
          'Déjà un compte ? ',
          React.createElement('button', { 
            type: 'button', 
            onClick: onSwitch,
            className: 'auth-link'
          }, 'Se connecter')
        )
      )
    )
  );
}

function ExpenseModal({ expense, onSave, onClose }) {
  const [description, setDescription] = useState(expense?.description || '');
  const [amount, setAmount] = useState(expense?.amount || '');
  const [category, setCategory] = useState(expense?.category || 'Divers');
  const [date, setDate] = useState(expense?.date || new Date().toISOString().split('T')[0]);

  function submit(e) {
    e.preventDefault();
    onSave({ description, amount: parseFloat(amount), category, date });
  }

  return React.createElement('div', { className: 'modal-overlay', onClick: onClose },
    React.createElement('div', { 
      className: 'modal-content',
      onClick: e => e.stopPropagation()
    },
      React.createElement('div', { className: 'modal-header' },
        React.createElement('h3', { className: 'modal-title' }, 
          expense ? 'Modifier la dépense' : 'Nouvelle dépense'
        ),
        React.createElement('button', { 
          className: 'modal-close',
          onClick: onClose 
        }, '×')
      ),
      React.createElement('form', { onSubmit: submit, className: 'expense-form' },
        React.createElement('input', {
          type: 'text',
          value: description,
          onChange: e => setDescription(e.target.value),
          placeholder: 'Description',
          required: true,
          className: 'form-input'
        }),
        React.createElement('input', {
          type: 'number',
          value: amount,
          onChange: e => setAmount(e.target.value),
          placeholder: 'Montant',
          step: '0.01',
          required: true,
          className: 'form-input'
        }),
        React.createElement('select', {
          value: category,
          onChange: e => setCategory(e.target.value),
          className: 'form-select'
        },
          CATEGORIES.map(cat => 
            React.createElement('option', { key: cat, value: cat }, cat)
          )
        ),
        React.createElement('input', {
          type: 'date',
          value: date,
          onChange: e => setDate(e.target.value),
          required: true,
          className: 'form-input'
        }),
        React.createElement('div', { className: 'form-actions' },
          React.createElement('button', { 
            type: 'button', 
            onClick: onClose,
            className: 'btn-secondary'
          }, 'Annuler'),
          React.createElement('button', { 
            type: 'submit',
            className: 'btn-primary'
          }, expense ? 'Modifier' : 'Ajouter')
        )
      )
    )
  );
}

function StatsCard({ title, value, icon, color = '#3b82f6' }) {
  return React.createElement('div', { 
    className: 'stats-card',
    style: { borderLeft: `4px solid ${color}` }
  },
    React.createElement('div', { className: 'stats-content' },
      React.createElement('div', { className: 'stats-header' },
        React.createElement('span', { className: 'stats-icon' }, icon),
        React.createElement('h3', { className: 'stats-title' }, title)
      ),
      React.createElement('p', { className: 'stats-value' }, value)
    )
  );
}

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [q, setQ] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [isLogin, setIsLogin] = useState(true);

  const headers = useMemo(() => ({ 
    Authorization: 'Bearer ' + token, 
    'Content-Type': 'application/json' 
  }), [token]);

  // Effect pour charger les données initiales
  useEffect(() => { 
    if (user?.id) {
      fetchExpenses(); 
    }
  }, [user?.id]);

  // Vérifier le token au démarrage
  useEffect(() => {
    if (token) {
      fetch('/api/me', { headers: { Authorization: 'Bearer ' + token } })
        .then(res => res.json())
        .then(userData => {
          if (userData.id) {
            setUser(userData);
          } else {
            logout();
          }
        })
        .catch(() => logout());
    }
  }, [token]);

  async function fetchExpenses() {
    try {
      const res = await fetch('/api/expenses', { headers });
      if (!res.ok) throw new Error('Failed to fetch expenses');
      const data = await res.json();
      setExpenses(data.sort((a,b) => new Date(b.date) - new Date(a.date)));
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  }

  function login(token, userData) {
    localStorage.setItem('token', token);
    setToken(token);
    setUser(userData);
  }

  function logout() {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setExpenses([]);
  }

  async function saveExpense(formData) {
    try {
      const method = editingExpense ? 'PUT' : 'POST';
      const url = editingExpense ? `/api/expenses/${editingExpense.id}` : '/api/expenses';
      const res = await fetch(url, { 
        method, 
        headers, 
        body: JSON.stringify(formData) 
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Erreur lors de la sauvegarde');
      }
      
      if (editingExpense) {
        setExpenses(expenses.map(e => 
          e.id === editingExpense.id ? {...e, ...formData} : e
        ));
      } else {
        const created = await res.json();
        setExpenses([created, ...expenses]);
      }
      
      setShowModal(false);
      setEditingExpense(null);
    } catch (error) {
      alert(error.message);
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
      
      setExpenses(expenses.filter(e => e.id !== id));
    } catch (error) {
      alert(error.message);
    }
  }

  function openEditModal(expense) {
    setEditingExpense(expense);
    setShowModal(true);
  }

  // Calculs des statistiques
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  const thisMonth = expenses.filter(e => 
    new Date(e.date).getMonth() === new Date().getMonth() &&
    new Date(e.date).getFullYear() === new Date().getFullYear()
  );
  const monthlyTotal = thisMonth.reduce((sum, e) => sum + e.amount, 0);
  const avgPerExpense = expenses.length ? total / expenses.length : 0;
  
  const categoryStats = CATEGORIES.map(cat => {
    const catExpenses = expenses.filter(e => e.category === cat);
    const catTotal = catExpenses.reduce((sum, e) => sum + e.amount, 0);
    return { name: cat, value: catTotal, count: catExpenses.length };
  }).filter(cat => cat.value > 0);

  // Filtrer les dépenses
  const filteredExpenses = expenses.filter(x => 
    x.description.toLowerCase().includes(q.toLowerCase()) &&
    (!filterCategory || x.category === filterCategory)
  );

  // Si pas connecté, afficher l'authentification
  if (!token || !user) {
    return isLogin 
      ? React.createElement(LoginForm, { 
          onLogin: login, 
          onSwitch: () => setIsLogin(false) 
        })
      : React.createElement(RegisterForm, { 
          onRegister: login, 
          onSwitch: () => setIsLogin(true) 
        });
  }

  // Interface principale
  return React.createElement('div', { className: 'app' },
    // Header
    React.createElement('header', { className: 'app-header' },
      React.createElement('div', { className: 'header-content' },
        React.createElement('div', { className: 'header-left' },
          React.createElement('h1', { className: 'app-title' }, '💰 Depensify'),
          React.createElement('p', { className: 'app-subtitle' }, `Bonjour ${user.username}`)
        ),
        React.createElement('button', { 
          onClick: logout,
          className: 'logout-btn'
        }, '🚪 Déconnexion')
      )
    ),

    // Contenu principal
    React.createElement('main', { className: 'main-content' },
      // Statistiques
      React.createElement('section', { className: 'stats-section' },
        React.createElement('div', { className: 'stats-grid' },
          React.createElement(StatsCard, {
            title: 'Total dépenses',
            value: fmt(total),
            icon: '💳',
            color: '#ef4444'
          }),
          React.createElement(StatsCard, {
            title: 'Ce mois',
            value: fmt(monthlyTotal),
            icon: '📅',
            color: '#10b981'
          }),
          React.createElement(StatsCard, {
            title: 'Moyenne/dépense',
            value: fmt(avgPerExpense),
            icon: '📊',
            color: '#8b5cf6'
          }),
          React.createElement(StatsCard, {
            title: 'Nombre total',
            value: expenses.length.toString(),
            icon: '🧾',
            color: '#f59e0b'
          })
        )
      ),

      // Graphique des catégories
      categoryStats.length > 0 && React.createElement('section', { className: 'chart-section' },
        React.createElement('div', { className: 'chart-container' },
          React.createElement('h3', { className: 'chart-title' }, '📈 Répartition par catégorie'),
          React.createElement('canvas', { 
            id: 'categoryChart',
            className: 'category-chart'
          })
        )
      ),

      // Contrôles et liste des dépenses
      React.createElement('section', { className: 'expenses-section' },
        React.createElement('div', { className: 'expenses-header' },
          React.createElement('h3', { className: 'section-title' }, '🧾 Mes dépenses'),
          React.createElement('button', { 
            onClick: () => setShowModal(true),
            className: 'btn-add'
          }, '+ Nouvelle dépense')
        ),

        // Filtres
        React.createElement('div', { className: 'filters' },
          React.createElement('input', {
            type: 'text',
            value: q,
            onChange: e => setQ(e.target.value),
            placeholder: '🔍 Rechercher une dépense...',
            className: 'search-input'
          }),
          React.createElement('select', {
            value: filterCategory,
            onChange: e => setFilterCategory(e.target.value),
            className: 'filter-select'
          },
            React.createElement('option', { value: '' }, 'Toutes les catégories'),
            CATEGORIES.map(cat => 
              React.createElement('option', { key: cat, value: cat }, cat)
            )
          )
        ),

        // Liste des dépenses
        React.createElement('div', { className: 'expenses-list' },
          filteredExpenses.length === 0 
            ? React.createElement('div', { className: 'empty-state' },
                React.createElement('p', null, '💸 Aucune dépense trouvée')
              )
            : filteredExpenses.map(expense => 
                React.createElement('div', { 
                  key: expense.id,
                  className: 'expense-card'
                },
                  React.createElement('div', { className: 'expense-main' },
                    React.createElement('div', { className: 'expense-info' },
                      React.createElement('h4', { className: 'expense-description' }, 
                        expense.description
                      ),
                      React.createElement('div', { className: 'expense-meta' },
                        React.createElement('span', { 
                          className: 'expense-category',
                          style: { color: CATEGORY_COLORS[expense.category] }
                        }, expense.category),
                        React.createElement('span', { className: 'expense-date' }, 
                          new Date(expense.date).toLocaleDateString('fr-FR')
                        )
                      )
                    ),
                    React.createElement('div', { className: 'expense-amount' }, 
                      fmt(expense.amount)
                    )
                  ),
                  React.createElement('div', { className: 'expense-actions' },
                    React.createElement('button', { 
                      onClick: () => openEditModal(expense),
                      className: 'btn-edit'
                    }, '✏️'),
                    React.createElement('button', { 
                      onClick: () => deleteExpense(expense.id),
                      className: 'btn-delete'
                    }, '🗑️')
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

// Fonction pour initialiser le graphique
function initChart(categoryStats) {
  const canvas = document.getElementById('categoryChart');
  if (!canvas || !categoryStats.length) return;

  const ctx = canvas.getContext('2d');
  
  if (window.expenseChart) {
    window.expenseChart.destroy();
  }

  window.expenseChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: categoryStats.map(c => c.name),
      datasets: [{
        data: categoryStats.map(c => c.value),
        backgroundColor: categoryStats.map(c => CATEGORY_COLORS[c.name]),
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 20,
            usePointStyle: true,
            font: { size: 12 }
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return context.label + ': ' + fmt(context.parsed);
            }
          }
        }
      }
    }
  });
}

// Observer pour initialiser le graphique quand les données changent
let chartObserver = null;

function observeChart() {
  if (chartObserver) return;
  
  chartObserver = new MutationObserver(() => {
    const canvas = document.getElementById('categoryChart');
    if (canvas && window.categoryStatsData) {
      setTimeout(() => initChart(window.categoryStatsData), 100);
    }
  });
  
  chartObserver.observe(document.body, { 
    childList: true, 
    subtree: true 
  });
}

// Démarrer l'observation
observeChart();

// Rendre l'application
ReactDOM.render(React.createElement(App), document.getElementById('root'));