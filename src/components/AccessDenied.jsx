export default function AccessDenied({ onLogout }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg p-10 w-full max-w-sm text-center">
        <div className="text-4xl mb-4">🔒</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Acesso não autorizado</h2>
        <p className="text-gray-500 text-sm mb-6">
          Seu e-mail não está na lista de usuários autorizados. Entre em contato com o administrador.
        </p>
        <button
          onClick={onLogout}
          className="text-sm text-brand-700 underline hover:text-brand-900"
        >
          Sair e usar outra conta
        </button>
      </div>
    </div>
  )
}
