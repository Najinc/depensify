// Composant d'authentification unifié
function AuthPage({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);

  return React.createElement('div', { className: 'min-h-screen flex items-center justify-center p-4' },
    React.createElement('div', { className: 'card w-full max-w-md glass-effect shadow-2xl' },
      React.createElement('div', { className: 'card-body' },
        React.createElement('div', { className: 'text-center mb-6' },
          React.createElement('span', { className: 'text-6xl mb-4 block' }, '💰'),
          React.createElement('h1', { className: 'text-3xl font-bold text-white' }, 'Depensify'),
          React.createElement('p', { className: 'text-base-content/70 mt-2' }, 'Gestion des dépenses familiales')
        ),

        React.createElement('div', { className: 'tabs tabs-boxed mb-6' },
          React.createElement('button', {
            onClick: () => setIsLogin(true),
            className: `tab ${isLogin ? 'tab-active' : ''}`
          }, 'Connexion'),
          React.createElement('button', {
            onClick: () => setIsLogin(false),
            className: `tab ${!isLogin ? 'tab-active' : ''}`
          }, 'Inscription')
        ),

        isLogin 
          ? React.createElement(LoginForm, { onLogin })
          : React.createElement(RegisterForm, { onLogin })
      )
    )
  );
}

// Formulaire de connexion
function LoginForm({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (response.ok) {
        onLogin(data.token, data.user);
      } else {
        setError(data.error || 'Erreur de connexion');
      }
    } catch (err) {
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  }

  return React.createElement('form', { onSubmit: handleSubmit, className: 'space-y-4' },
    React.createElement('div', { className: 'form-control' },
      React.createElement('label', { className: 'label' },
        React.createElement('span', { className: 'label-text text-white' }, 'Nom d\'utilisateur')
      ),
      React.createElement('input', {
        type: 'text',
        value: username,
        onChange: e => setUsername(e.target.value),
        className: 'input input-bordered w-full',
        placeholder: 'Entrez votre nom d\'utilisateur',
        required: true
      })
    ),

    React.createElement('div', { className: 'form-control' },
      React.createElement('label', { className: 'label' },
        React.createElement('span', { className: 'label-text text-white' }, 'Mot de passe')
      ),
      React.createElement('input', {
        type: 'password',
        value: password,
        onChange: e => setPassword(e.target.value),
        className: 'input input-bordered w-full',
        placeholder: 'Entrez votre mot de passe',
        required: true
      })
    ),

    error && React.createElement('div', { className: 'alert alert-error' },
      React.createElement('span', null, error)
    ),

    React.createElement('button', {
      type: 'submit',
      disabled: loading,
      className: `btn btn-primary w-full ${loading ? 'loading' : ''}`
    }, loading ? 'Connexion...' : 'Se connecter')
  );
}

// Formulaire d'inscription
function RegisterForm({ onLogin }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });

      const data = await response.json();

      if (response.ok) {
        if (data.token) {
          onLogin(data.token, data.user);
        } else {
          setSuccess(data.message || 'Compte créé! En attente d\'approbation.');
        }
      } else {
        setError(data.error || 'Erreur lors de l\'inscription');
      }
    } catch (err) {
      setError('Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  }

  return React.createElement('form', { onSubmit: handleSubmit, className: 'space-y-4' },
    React.createElement('div', { className: 'form-control' },
      React.createElement('label', { className: 'label' },
        React.createElement('span', { className: 'label-text text-white' }, 'Nom d\'utilisateur')
      ),
      React.createElement('input', {
        type: 'text',
        value: username,
        onChange: e => setUsername(e.target.value),
        className: 'input input-bordered w-full',
        placeholder: 'Choisissez un nom d\'utilisateur',
        required: true
      })
    ),

    React.createElement('div', { className: 'form-control' },
      React.createElement('label', { className: 'label' },
        React.createElement('span', { className: 'label-text text-white' }, 'Email (optionnel)')
      ),
      React.createElement('input', {
        type: 'email',
        value: email,
        onChange: e => setEmail(e.target.value),
        className: 'input input-bordered w-full',
        placeholder: 'votre@email.com'
      })
    ),

    React.createElement('div', { className: 'form-control' },
      React.createElement('label', { className: 'label' },
        React.createElement('span', { className: 'label-text text-white' }, 'Mot de passe')
      ),
      React.createElement('input', {
        type: 'password',
        value: password,
        onChange: e => setPassword(e.target.value),
        className: 'input input-bordered w-full',
        placeholder: 'Au moins 6 caractères',
        required: true,
        minLength: 6
      })
    ),

    error && React.createElement('div', { className: 'alert alert-error' },
      React.createElement('span', null, error)
    ),

    success && React.createElement('div', { className: 'alert alert-success' },
      React.createElement('span', null, success)
    ),

    React.createElement('button', {
      type: 'submit',
      disabled: loading,
      className: `btn btn-primary w-full ${loading ? 'loading' : ''}`
    }, loading ? 'Création...' : 'Créer un compte')
  );
}