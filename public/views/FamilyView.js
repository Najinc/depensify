// Vue de gestion de famille
function FamilyView({ user, token }) {
  const [family, setFamily] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview, members, settings, join-create
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  useEffect(() => {
    loadFamilyDetails();
  }, []);

  async function loadFamilyDetails() {
    try {
      const response = await fetch('/api/family/details', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setFamily(data.family);
      }
    } catch (error) {
      console.error('Error loading family details:', error);
    } finally {
      setLoading(false);
    }
  }

  // Fonction utilitaire pour créer des toasts avec z-index élevé
  function createToast(type, message) {
    const toast = document.createElement('div');
    toast.className = 'toast toast-top toast-end z-50';
    toast.innerHTML = `
      <div class="alert alert-${type}">
        <span>${message}</span>
      </div>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  // Modales et composants
  function CreateFamilyModal() {
    const [formData, setFormData] = useState({
      name: '',
      description: '',
      allowMemberInvites: false,
      requireApprovalForJoin: true,
      defaultMemberRole: 'member'
    });
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(e) {
      e.preventDefault();
      setSubmitting(true);

      try {
        const response = await fetch('/api/family/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        });

        if (response.ok) {
          setShowCreateModal(false);
          loadFamilyDetails();
          createToast('success', '✅ Famille créée avec succès !');
        } else {
          const error = await response.json();
          throw new Error(error.error);
        }
      } catch (error) {
        createToast('error', `❌ ${error.message}`);
      } finally {
        setSubmitting(false);
      }
    }

    return React.createElement('div', { className: 'modal modal-open' },
      React.createElement('div', { className: 'modal-box' },
        React.createElement('h3', { className: 'font-bold text-lg mb-4' }, '🏠 Créer une famille'),
        
        React.createElement('form', { onSubmit: handleSubmit },
          React.createElement('div', { className: 'form-control mb-4' },
            React.createElement('label', { className: 'label' },
              React.createElement('span', { className: 'label-text' }, 'Nom de la famille')
            ),
            React.createElement('input', {
              type: 'text',
              className: 'input input-bordered',
              value: formData.name,
              onChange: (e) => setFormData({...formData, name: e.target.value}),
              required: true,
              placeholder: 'Ma Famille'
            })
          ),

          React.createElement('div', { className: 'form-control mb-4' },
            React.createElement('label', { className: 'label' },
              React.createElement('span', { className: 'label-text' }, 'Description (optionnel)')
            ),
            React.createElement('textarea', {
              className: 'textarea textarea-bordered',
              value: formData.description,
              onChange: (e) => setFormData({...formData, description: e.target.value}),
              placeholder: 'Description de votre famille...'
            })
          ),

          React.createElement('div', { className: 'form-control mb-4' },
            React.createElement('label', { className: 'label cursor-pointer' },
              React.createElement('span', { className: 'label-text' }, 'Permettre aux membres d\'inviter d\'autres personnes'),
              React.createElement('input', {
                type: 'checkbox',
                className: 'checkbox',
                checked: formData.allowMemberInvites,
                onChange: (e) => setFormData({...formData, allowMemberInvites: e.target.checked})
              })
            )
          ),

          React.createElement('div', { className: 'form-control mb-6' },
            React.createElement('label', { className: 'label' },
              React.createElement('span', { className: 'label-text' }, 'Rôle par défaut des nouveaux membres')
            ),
            React.createElement('select', {
              className: 'select select-bordered',
              value: formData.defaultMemberRole,
              onChange: (e) => setFormData({...formData, defaultMemberRole: e.target.value})
            },
              React.createElement('option', { value: 'member' }, 'Membre'),
              React.createElement('option', { value: 'viewer' }, 'Observateur')
            )
          ),

          React.createElement('div', { className: 'modal-action' },
            React.createElement('button', {
              type: 'button',
              className: 'btn',
              onClick: () => setShowCreateModal(false)
            }, 'Annuler'),
            React.createElement('button', {
              type: 'submit',
              className: `btn btn-primary ${submitting ? 'loading' : ''}`,
              disabled: submitting
            }, submitting ? 'Création...' : 'Créer la famille')
          )
        )
      )
    );
  }

  function JoinFamilyModal() {
    const [inviteCode, setInviteCode] = useState('');
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(e) {
      e.preventDefault();
      setSubmitting(true);

      try {
        const response = await fetch('/api/family/join', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ inviteCode })
        });

        if (response.ok) {
          setShowJoinModal(false);
          loadFamilyDetails();
          createToast('success', '✅ Vous avez rejoint la famille !');
        } else {
          const error = await response.json();
          throw new Error(error.error);
        }
      } catch (error) {
        createToast('error', `❌ ${error.message}`);
      } finally {
        setSubmitting(false);
      }
    }

    return React.createElement('div', { className: 'modal modal-open' },
      React.createElement('div', { className: 'modal-box' },
        React.createElement('h3', { className: 'font-bold text-lg mb-4' }, '👨‍👩‍👧‍👦 Rejoindre une famille'),
        
        React.createElement('form', { onSubmit: handleSubmit },
          React.createElement('div', { className: 'form-control mb-6' },
            React.createElement('label', { className: 'label' },
              React.createElement('span', { className: 'label-text' }, 'Code d\'invitation')
            ),
            React.createElement('input', {
              type: 'text',
              className: 'input input-bordered',
              value: inviteCode,
              onChange: (e) => setInviteCode(e.target.value.toUpperCase()),
              required: true,
              placeholder: 'Saisissez le code d\'invitation',
              maxLength: 6
            })
          ),

          React.createElement('div', { className: 'modal-action' },
            React.createElement('button', {
              type: 'button',
              className: 'btn',
              onClick: () => setShowJoinModal(false)
            }, 'Annuler'),
            React.createElement('button', {
              type: 'submit',
              className: `btn btn-primary ${submitting ? 'loading' : ''}`,
              disabled: submitting
            }, submitting ? 'Rejoindre...' : 'Rejoindre')
          )
        )
      )
    );
  }

  // Interface principale
  if (loading) {
    return React.createElement('div', { className: 'min-h-screen flex items-center justify-center' },
      React.createElement('div', { className: 'text-center' },
        React.createElement('span', { className: 'loading loading-spinner loading-lg text-primary' }),
        React.createElement('p', { className: 'text-white mt-4 text-lg' }, 'Chargement...')
      )
    );
  }

  // Si l'utilisateur n'a pas de famille
  if (!family) {
    return React.createElement('div', { className: 'container mx-auto p-6' },
      React.createElement('div', { className: 'text-center mb-8' },
        React.createElement('h1', { className: 'text-4xl font-bold text-white mb-4' }, '👨‍👩‍👧‍👦 Gestion de Famille'),
        React.createElement('p', { className: 'text-base-content/70 text-lg' }, 'Vous ne faites partie d\'aucune famille pour le moment')
      ),

      React.createElement('div', { className: 'max-w-2xl mx-auto' },
        React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-6' },
          // Créer une famille
          React.createElement('div', { className: 'card glass-effect shadow-xl' },
            React.createElement('div', { className: 'card-body text-center' },
              React.createElement('div', { className: 'text-6xl mb-4' }, '🏠'),
              React.createElement('h2', { className: 'card-title justify-center text-white mb-4' }, 'Créer une famille'),
              React.createElement('p', { className: 'text-base-content/70 mb-6' }, 'Créez votre propre famille et invitez vos proches à la rejoindre'),
              React.createElement('button', {
                className: 'btn btn-primary',
                onClick: () => setShowCreateModal(true)
              }, 'Créer ma famille')
            )
          ),

          // Rejoindre une famille
          React.createElement('div', { className: 'card glass-effect shadow-xl' },
            React.createElement('div', { className: 'card-body text-center' },
              React.createElement('div', { className: 'text-6xl mb-4' }, '🤝'),
              React.createElement('h2', { className: 'card-title justify-center text-white mb-4' }, 'Rejoindre une famille'),
              React.createElement('p', { className: 'text-base-content/70 mb-6' }, 'Utilisez un code d\'invitation pour rejoindre une famille existante'),
              React.createElement('button', {
                className: 'btn btn-secondary',
                onClick: () => setShowJoinModal(true)
              }, 'Rejoindre une famille')
            )
          )
        )
      ),

      // Modales
      showCreateModal && React.createElement(CreateFamilyModal),
      showJoinModal && React.createElement(JoinFamilyModal)
    );
  }

  // Interface pour les utilisateurs ayant une famille
  return React.createElement('div', { className: 'container mx-auto p-6' },
    // Header
    React.createElement('div', { className: 'text-center mb-8' },
      React.createElement('h1', { className: 'text-4xl font-bold text-white mb-2' }, `👨‍👩‍👧‍👦 ${family.name}`),
      family.description && React.createElement('p', { className: 'text-base-content/70 text-lg' }, family.description),
      React.createElement('div', { className: 'badge badge-primary mt-2' }, `Rôle: ${family.myRole}`)
    ),

    // Tabs de navigation
    React.createElement('div', { className: 'tabs tabs-boxed justify-center mb-8 glass-effect' },
      React.createElement('button', {
        className: `tab ${activeTab === 'overview' ? 'tab-active' : ''}`,
        onClick: () => setActiveTab('overview')
      }, '📊 Vue d\'ensemble'),
      React.createElement('button', {
        className: `tab ${activeTab === 'members' ? 'tab-active' : ''}`,
        onClick: () => setActiveTab('members')
      }, '👥 Membres'),
      family.isOwner && React.createElement('button', {
        className: `tab ${activeTab === 'settings' ? 'tab-active' : ''}`,
        onClick: () => setActiveTab('settings')
      }, '⚙️ Paramètres')
    ),

    // Contenu selon l'onglet actif
    activeTab === 'overview' && React.createElement(FamilyOverview, { family, user, token, loadFamilyDetails }),
    activeTab === 'members' && React.createElement(FamilyMembers, { family, user, token, loadFamilyDetails, createToast }),
    activeTab === 'settings' && family.isOwner && React.createElement(FamilySettings, { family, user, token, loadFamilyDetails, createToast })
  );
}

// Composants pour chaque onglet
function FamilyOverview({ family, user, token, loadFamilyDetails }) {
  async function copyInviteCode() {
    try {
      await navigator.clipboard.writeText(family.inviteCode);
      // Toast de succès avec z-index élevé
      const successToast = document.createElement('div');
      successToast.className = 'toast toast-top toast-end z-50';
      successToast.innerHTML = `
        <div class="alert alert-success">
          <span>📋 Code d'invitation copié !</span>
        </div>
      `;
      document.body.appendChild(successToast);
      setTimeout(() => successToast.remove(), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  }

  return React.createElement('div', { className: 'grid grid-cols-1 lg:grid-cols-2 gap-6' },
    // Informations générales
    React.createElement('div', { className: 'card glass-effect shadow-xl' },
      React.createElement('div', { className: 'card-body' },
        React.createElement('h2', { className: 'card-title text-white mb-4' }, '📋 Informations générales'),
        React.createElement('div', { className: 'space-y-3' },
          React.createElement('div', { className: 'flex justify-between' },
            React.createElement('span', { className: 'text-base-content/70' }, 'Propriétaire:'),
            React.createElement('span', { className: 'text-white font-semibold' }, family.owner.username)
          ),
          React.createElement('div', { className: 'flex justify-between' },
            React.createElement('span', { className: 'text-base-content/70' }, 'Membres:'),
            React.createElement('span', { className: 'text-white font-semibold' }, family.members.length)
          ),
          React.createElement('div', { className: 'flex justify-between' },
            React.createElement('span', { className: 'text-base-content/70' }, 'Créée le:'),
            React.createElement('span', { className: 'text-white font-semibold' }, 
              new Date(family.createdAt).toLocaleDateString('fr-FR')
            )
          )
        )
      )
    ),

    // Code d'invitation
    React.createElement('div', { className: 'card glass-effect shadow-xl' },
      React.createElement('div', { className: 'card-body' },
        React.createElement('h2', { className: 'card-title text-white mb-4' }, '🔗 Code d\'invitation'),
        React.createElement('div', { className: 'text-center' },
          React.createElement('div', { className: 'text-3xl font-mono font-bold text-primary mb-4' }, family.inviteCode),
          React.createElement('p', { className: 'text-base-content/70 mb-4' }, 'Partagez ce code pour inviter des membres'),
          React.createElement('button', {
            className: 'btn btn-primary btn-sm',
            onClick: copyInviteCode
          }, '📋 Copier le code')
        )
      )
    ),

    // Permissions actuelles
    React.createElement('div', { className: 'card glass-effect shadow-xl lg:col-span-2' },
      React.createElement('div', { className: 'card-body' },
        React.createElement('h2', { className: 'card-title text-white mb-4' }, '🔐 Vos permissions'),
        React.createElement('div', { className: 'grid grid-cols-2 md:grid-cols-4 gap-4' },
          Object.entries(family.myPermissions || {}).map(([key, value]) => 
            React.createElement('div', { 
              key,
              className: `badge ${value ? 'badge-success' : 'badge-error'} p-3`
            }, 
              `${value ? '✅' : '❌'} ${key.replace('can', '').replace(/([A-Z])/g, ' $1').trim()}`
            )
          )
        )
      )
    )
  );
}

function FamilyMembers({ family, user, token, loadFamilyDetails, createToast }) {
  const [selectedMember, setSelectedMember] = useState(null);
  const [showRoleModal, setShowRoleModal] = useState(false);

  async function updateMemberRole(memberId, role, permissions) {
    try {
      const response = await fetch(`/api/family/member/${memberId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role, permissions })
      });

      if (response.ok) {
        loadFamilyDetails();
        setShowRoleModal(false);
        createToast('success', '✅ Rôle mis à jour !');
      } else {
        const error = await response.json();
        throw new Error(error.error);
      }
    } catch (error) {
      createToast('error', `❌ ${error.message}`);
    }
  }

  async function removeMember(memberId) {
    if (!confirm('Êtes-vous sûr de vouloir retirer ce membre de la famille ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/family/member/${memberId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        loadFamilyDetails();
        createToast('success', '✅ Membre retiré !');
      } else {
        const error = await response.json();
        throw new Error(error.error);
      }
    } catch (error) {
      createToast('error', `❌ ${error.message}`);
    }
  }

  return React.createElement('div', null,
    React.createElement('div', { className: 'card glass-effect shadow-xl' },
      React.createElement('div', { className: 'card-body' },
        React.createElement('h2', { className: 'card-title text-white mb-6' }, '👥 Membres de la famille'),
        
        React.createElement('div', { className: 'overflow-x-auto' },
          React.createElement('table', { className: 'table table-zebra' },
            React.createElement('thead', null,
              React.createElement('tr', null,
                React.createElement('th', null, 'Membre'),
                React.createElement('th', null, 'Rôle'),
                React.createElement('th', null, 'Rejoint le'),
                family.myPermissions?.canManageMembers && React.createElement('th', null, 'Actions')
              )
            ),
            React.createElement('tbody', null,
              family.members.map(member => 
                React.createElement('tr', { key: member.id },
                  React.createElement('td', null,
                    React.createElement('div', { className: 'flex items-center gap-3' },
                      React.createElement('div', { className: 'avatar placeholder' },
                        React.createElement('div', { className: 'bg-primary text-primary-content rounded-full w-8' },
                          React.createElement('span', { className: 'text-xs' }, member.username.charAt(0).toUpperCase())
                        )
                      ),
                      React.createElement('div', null,
                        React.createElement('div', { className: 'font-bold' }, member.username),
                        family.owner.username === member.username && React.createElement('div', { className: 'badge badge-primary badge-xs' }, 'Propriétaire')
                      )
                    )
                  ),
                  React.createElement('td', null,
                    React.createElement('div', { className: `badge ${member.role === 'admin' ? 'badge-primary' : member.role === 'member' ? 'badge-secondary' : 'badge-ghost'}` }, 
                      member.role
                    )
                  ),
                  React.createElement('td', null, new Date(member.joinedAt).toLocaleDateString('fr-FR')),
                  family.myPermissions?.canManageMembers && member.id !== family.owner._id && React.createElement('td', null,
                    React.createElement('div', { className: 'flex gap-2' },
                      React.createElement('button', {
                        className: 'btn btn-xs btn-primary',
                        onClick: () => {
                          setSelectedMember(member);
                          setShowRoleModal(true);
                        }
                      }, 'Modifier'),
                      React.createElement('button', {
                        className: 'btn btn-xs btn-error',
                        onClick: () => removeMember(member.id)
                      }, 'Retirer')
                    )
                  )
                )
              )
            )
          )
        )
      )
    ),

    // Modale de modification des rôles
    showRoleModal && selectedMember && React.createElement(RoleModal, {
      member: selectedMember,
      onClose: () => setShowRoleModal(false),
      onUpdate: updateMemberRole
    })
  );
}

// Composant modal pour modifier les rôles
function RoleModal({ member, onClose, onUpdate }) {
  const [role, setRole] = useState(member.role);
  const [permissions, setPermissions] = useState(member.permissions);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    await onUpdate(member.id, role, permissions);
    setSubmitting(false);
  }

  return React.createElement('div', { className: 'modal modal-open z-50' },
    React.createElement('div', { className: 'modal-box' },
      React.createElement('h3', { className: 'font-bold text-lg mb-4' },
        `👤 Modifier le rôle de ${member.username}`
      ),
      
      React.createElement('form', { onSubmit: handleSubmit },
        React.createElement('div', { className: 'form-control mb-4' },
          React.createElement('label', { className: 'label' },
            React.createElement('span', { className: 'label-text' }, 'Rôle')
          ),
          React.createElement('select', {
            className: 'select select-bordered',
            value: role,
            onChange: (e) => setRole(e.target.value)
          },
            React.createElement('option', { value: 'admin' }, 'Administrateur'),
            React.createElement('option', { value: 'member' }, 'Membre'),
            React.createElement('option', { value: 'viewer' }, 'Observateur')
          )
        ),

        React.createElement('div', { className: 'form-control mb-6' },
          React.createElement('label', { className: 'label' },
            React.createElement('span', { className: 'label-text' }, 'Permissions')
          ),
          React.createElement('div', { className: 'grid grid-cols-2 gap-2' },
            Object.entries(permissions).map(([key, value]) =>
              React.createElement('label', {
                key,
                className: 'label cursor-pointer'
              },
                React.createElement('span', { className: 'label-text text-xs' },
                  key.replace('can', '').replace(/([A-Z])/g, ' $1').trim()
                ),
                React.createElement('input', {
                  type: 'checkbox',
                  className: 'checkbox checkbox-xs',
                  checked: value,
                  onChange: (e) => setPermissions({
                    ...permissions,
                    [key]: e.target.checked
                  })
                })
              )
            )
          )
        ),

        React.createElement('div', { className: 'modal-action' },
          React.createElement('button', {
            type: 'button',
            className: 'btn',
            onClick: onClose
          }, 'Annuler'),
          React.createElement('button', {
            type: 'submit',
            className: `btn btn-primary ${submitting ? 'loading' : ''}`,
            disabled: submitting
          }, submitting ? 'Sauvegarde...' : 'Sauvegarder')
        )
      )
    )
  );
}

function FamilySettings({ family, user, token, loadFamilyDetails, createToast }) {
  const [settings, setSettings] = useState({
    name: family.name,
    description: family.description || '',
    allowMemberInvites: family.settings.allowMemberInvites,
    requireApprovalForJoin: family.settings.requireApprovalForJoin,
    defaultMemberRole: family.settings.defaultMemberRole
  });
  const [saving, setSaving] = useState(false);

  async function saveSettings(e) {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch('/api/family/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        loadFamilyDetails();
        createToast('success', '✅ Paramètres sauvegardés !');
      } else {
        const error = await response.json();
        throw new Error(error.error);
      }
    } catch (error) {
      createToast('error', `❌ ${error.message}`);
    } finally {
      setSaving(false);
    }
  }

  return React.createElement('div', { className: 'card glass-effect shadow-xl' },
    React.createElement('div', { className: 'card-body' },
      React.createElement('h2', { className: 'card-title text-white mb-6' }, '⚙️ Paramètres de la famille'),
      
      React.createElement('form', { onSubmit: saveSettings },
        React.createElement('div', { className: 'form-control mb-4' },
          React.createElement('label', { className: 'label' },
            React.createElement('span', { className: 'label-text' }, 'Nom de la famille')
          ),
          React.createElement('input', {
            type: 'text',
            className: 'input input-bordered',
            value: settings.name,
            onChange: (e) => setSettings({...settings, name: e.target.value}),
            required: true
          })
        ),

        React.createElement('div', { className: 'form-control mb-4' },
          React.createElement('label', { className: 'label' },
            React.createElement('span', { className: 'label-text' }, 'Description')
          ),
          React.createElement('textarea', {
            className: 'textarea textarea-bordered',
            value: settings.description,
            onChange: (e) => setSettings({...settings, description: e.target.value}),
            placeholder: 'Description de votre famille...'
          })
        ),

        React.createElement('div', { className: 'form-control mb-4' },
          React.createElement('label', { className: 'label cursor-pointer' },
            React.createElement('span', { className: 'label-text' }, 'Permettre aux membres d\'inviter d\'autres personnes'),
            React.createElement('input', {
              type: 'checkbox',
              className: 'checkbox',
              checked: settings.allowMemberInvites,
              onChange: (e) => setSettings({...settings, allowMemberInvites: e.target.checked})
            })
          )
        ),

        React.createElement('div', { className: 'form-control mb-6' },
          React.createElement('label', { className: 'label' },
            React.createElement('span', { className: 'label-text' }, 'Rôle par défaut des nouveaux membres')
          ),
          React.createElement('select', {
            className: 'select select-bordered',
            value: settings.defaultMemberRole,
            onChange: (e) => setSettings({...settings, defaultMemberRole: e.target.value})
          },
            React.createElement('option', { value: 'member' }, 'Membre'),
            React.createElement('option', { value: 'viewer' }, 'Observateur')
          )
        ),

        React.createElement('div', { className: 'card-actions justify-end' },
          React.createElement('button', {
            type: 'submit',
            className: `btn btn-primary ${saving ? 'loading' : ''}`,
            disabled: saving
          }, saving ? 'Sauvegarde...' : 'Sauvegarder')
        )
      )
    )
  );
}