// Composant Navigation avec Tailwind/DaisyUI
function Navigation({ user, currentView, setCurrentView, onLogout }) {
  return React.createElement('div', { className: 'navbar glass-effect sticky top-0 z-50 backdrop-blur-lg' },
    React.createElement('div', { className: 'navbar-start' },
      React.createElement('div', { className: 'dropdown' },
        React.createElement('div', { tabIndex: 0, role: 'button', className: 'btn btn-ghost lg:hidden' },
          React.createElement('svg', { className: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' },
            React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: '2', d: 'M4 6h16M4 12h8m-8 6h16' })
          )
        )
      ),
      React.createElement('div', { className: 'flex items-center gap-3' },
        React.createElement('span', { className: 'text-3xl' }, '💰'),
        React.createElement('div', null,
          React.createElement('h1', { className: 'text-xl font-bold text-white' }, 'Depensify'),
          React.createElement('p', { className: 'text-sm text-base-content/70' }, `Bonjour, ${user.username}`)
        )
      )
    ),

    React.createElement('div', { className: 'navbar-center hidden lg:flex' },
      React.createElement('ul', { className: 'menu menu-horizontal px-1 gap-2' },
        React.createElement('li', null,
          React.createElement('button', {
            onClick: () => setCurrentView('expenses'),
            className: `btn btn-ghost ${currentView === 'expenses' ? 'btn-active' : ''}`
          }, 
            React.createElement('svg', { className: 'w-5 h-5', fill: 'currentColor', viewBox: '0 0 24 24' },
              React.createElement('path', { d: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z' })
            ),
            'Dépenses'
          )
        ),
        React.createElement('li', null,
          React.createElement('button', {
            onClick: () => setCurrentView('family'),
            className: `btn btn-ghost ${currentView === 'family' ? 'btn-active' : ''}`
          }, 
            React.createElement('svg', { className: 'w-5 h-5', fill: 'currentColor', viewBox: '0 0 24 24' },
              React.createElement('path', { d: 'M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63a1.5 1.5 0 0 0-1.42-1.01c-.8 0-1.54.5-1.85 1.26l-1.73 5.2C15.24 15.65 16 17.24 16 19v3h4zm-12.5-11c.83 0 1.5-.67 1.5-1.5S8.33 8 7.5 8 6 8.67 6 9.5 6.67 11 7.5 11zm2 2c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm-6.5 7h9v2h-9z' })
            ),
            'Famille'
          )
        ),
        user.isAdmin && React.createElement('li', null,
          React.createElement('button', {
            onClick: () => setCurrentView('admin'),
            className: `btn btn-ghost ${currentView === 'admin' ? 'btn-active' : ''}`
          }, 
            React.createElement('svg', { className: 'w-5 h-5', fill: 'currentColor', viewBox: '0 0 24 24' },
              React.createElement('path', { d: 'M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z' })
            ),
            'Administration'
          )
        )
      )
    ),

    React.createElement('div', { className: 'navbar-end' },
      React.createElement('div', { className: 'dropdown dropdown-end' },
        React.createElement('div', { tabIndex: 0, role: 'button', className: 'btn btn-ghost btn-circle avatar' },
          React.createElement('div', { className: 'w-10 rounded-full bg-primary text-primary-content flex items-center justify-center' },
            React.createElement('span', { className: 'font-bold' }, user.username.charAt(0).toUpperCase())
          )
        ),
        React.createElement('ul', { tabIndex: 0, className: 'mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52' },
          user.isAdmin && React.createElement('li', null,
            React.createElement('span', { className: 'text-primary font-semibold' }, '🔐 Administrateur')
          ),
          React.createElement('li', null,
            React.createElement('button', { onClick: onLogout }, 
              React.createElement('span', { className: 'text-error' }, '👋 Déconnexion')
            )
          )
        )
      )
    )
  );
}