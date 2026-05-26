import { useState } from 'react'

export default function TopBar({ workspace, onWorkspaceChange, onSearch, user, isAdmin, onLogout, onAdmin }) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="h-12 bg-white border-b border-gray-200 flex items-center px-5 gap-4 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2 mr-2">
        <div className="w-7 h-7 bg-brand-900 rounded-md flex items-center justify-center">
          <span className="text-white text-xs font-extrabold">AP</span>
        </div>
        <span className="text-sm font-bold text-brand-900 hidden sm:block">Vasconcelos</span>
      </div>

      {/* Workspace tabs */}
      <nav className="flex gap-1">
        {[
          { id: 'advocacia', label: '⚖️ Advocacia' },
          { id: 'docencia',  label: '🎓 Docência'  },
        ].map(({ id, label }) => (
          <button
            key={id}
            onClick={() => onWorkspaceChange(id)}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
              workspace === id
                ? 'bg-brand-50 text-brand-700'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            {label}
          </button>
        ))}
      </nav>

      {/* Search */}
      <div className="flex-1 max-w-xs ml-auto">
        <input
          type="search"
          placeholder="Buscar tarefa, cliente..."
          onChange={e => onSearch(e.target.value)}
          className="w-full text-xs px-3 py-1.5 bg-gray-100 rounded-lg border-none outline-none focus:ring-2 focus:ring-brand-900/20"
        />
      </div>

      {/* Avatar + menu */}
      <div className="relative">
        <button
          onClick={() => setMenuOpen(o => !o)}
          className="w-8 h-8 rounded-full bg-brand-900 text-white text-xs font-bold flex items-center justify-center overflow-hidden"
        >
          {user?.photoURL
            ? <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
            : (user?.displayName?.[0] ?? '?')}
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-10 bg-white rounded-xl shadow-lg border border-gray-100 py-1 w-44 z-50">
            <div className="px-3 py-2 text-xs text-gray-400 border-b border-gray-100 truncate">
              {user?.email}
            </div>
            {isAdmin && (
              <button
                onClick={() => { setMenuOpen(false); onAdmin() }}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                ⚙️ Gerenciar usuários
              </button>
            )}
            <button
              onClick={onLogout}
              className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50"
            >
              Sair
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
