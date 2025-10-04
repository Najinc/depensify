// Composant graphique avec Chart.js
function CategoryChart({ expenses }) {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (!chartRef.current || !expenses?.length) return;

    // Détruire le graphique existant
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');

    // Calculer les données par catégorie
    const categoryData = CATEGORIES.map(cat => {
      const catExpenses = expenses.filter(e => e.category === cat);
      return {
        label: cat,
        value: catExpenses.reduce((sum, e) => sum + e.amount, 0),
        count: catExpenses.length
      };
    }).filter(cat => cat.value > 0);

    if (categoryData.length === 0) return;

    chartInstance.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: categoryData.map(cat => cat.label),
        datasets: [{
          data: categoryData.map(cat => cat.value),
          backgroundColor: categoryData.map(cat => CATEGORY_COLORS[cat.label]),
          borderWidth: 2,
          borderColor: 'rgba(255, 255, 255, 0.2)'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: 'white',
              padding: 20,
              usePointStyle: true
            }
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const cat = categoryData[context.dataIndex];
                return `${cat.label}: ${fmt(cat.value)} (${cat.count} dépense${cat.count > 1 ? 's' : ''})`;
              }
            }
          }
        }
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [expenses]);

  if (!expenses?.length) {
    return React.createElement('div', { className: 'text-center py-8' },
      React.createElement('p', { className: 'text-base-content/50' }, '📊 Aucune donnée à afficher')
    );
  }

  return React.createElement('div', { className: 'chart-container' },
    React.createElement('canvas', { ref: chartRef })
  );
}

// Composant de statistiques
function StatsCard({ title, value, icon, description }) {
  return React.createElement('div', { className: 'stat' },
    React.createElement('div', { className: 'stat-figure text-primary text-2xl' }, icon),
    React.createElement('div', { className: 'stat-title text-base-content/70' }, title),
    React.createElement('div', { className: 'stat-value text-primary' }, value),
    description && React.createElement('div', { className: 'stat-desc text-base-content/50' }, description)
  );
}

// Composant modal pour ajouter/éditer une dépense
function ExpenseModal({ expense, onSave, onClose }) {
  const [description, setDescription] = useState(expense?.description || '');
  const [amount, setAmount] = useState(expense?.amount || '');
  const [category, setCategory] = useState(expense?.category || 'Divers');
  const [date, setDate] = useState(expense?.date || new Date().toISOString().split('T')[0]);

  function handleSubmit(e) {
    e.preventDefault();
    onSave({ description, amount: parseFloat(amount), category, date });
  }

  return React.createElement('div', { className: 'modal modal-open' },
    React.createElement('div', { className: 'modal-box glass-effect' },
      React.createElement('h3', { className: 'font-bold text-lg text-white mb-4' },
        expense ? '✏️ Modifier la dépense' : '➕ Nouvelle dépense'
      ),

      React.createElement('form', { onSubmit: handleSubmit, className: 'space-y-4' },
        React.createElement('div', { className: 'form-control' },
          React.createElement('label', { className: 'label' },
            React.createElement('span', { className: 'label-text text-white' }, 'Description')
          ),
          React.createElement('input', {
            type: 'text',
            value: description,
            onChange: e => setDescription(e.target.value),
            className: 'input input-bordered w-full',
            placeholder: 'Décrivez votre dépense...',
            required: true
          })
        ),

        React.createElement('div', { className: 'grid grid-cols-2 gap-4' },
          React.createElement('div', { className: 'form-control' },
            React.createElement('label', { className: 'label' },
              React.createElement('span', { className: 'label-text text-white' }, 'Montant (€)')
            ),
            React.createElement('input', {
              type: 'number',
              step: '0.01',
              min: '0',
              value: amount,
              onChange: e => setAmount(e.target.value),
              className: 'input input-bordered w-full',
              placeholder: '0.00',
              required: true
            })
          ),

          React.createElement('div', { className: 'form-control' },
            React.createElement('label', { className: 'label' },
              React.createElement('span', { className: 'label-text text-white' }, 'Catégorie')
            ),
            React.createElement('select', {
              value: category,
              onChange: e => setCategory(e.target.value),
              className: 'select select-bordered w-full'
            },
              CATEGORIES.map(cat =>
                React.createElement('option', { key: cat, value: cat }, cat)
              )
            )
          )
        ),

        React.createElement('div', { className: 'form-control' },
          React.createElement('label', { className: 'label' },
            React.createElement('span', { className: 'label-text text-white' }, 'Date')
          ),
          React.createElement('input', {
            type: 'date',
            value: date,
            onChange: e => setDate(e.target.value),
            className: 'input input-bordered w-full',
            required: true
          })
        ),

        React.createElement('div', { className: 'modal-action' },
          React.createElement('button', {
            type: 'button',
            onClick: onClose,
            className: 'btn btn-ghost'
          }, 'Annuler'),
          React.createElement('button', {
            type: 'submit',
            className: 'btn btn-primary'
          }, expense ? 'Modifier' : 'Ajouter')
        )
      )
    )
  );
}