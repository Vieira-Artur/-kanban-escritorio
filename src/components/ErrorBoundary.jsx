import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo)
    // Futuro: enviar para serviço de monitoramento (Sentry, LogRocket, etc.)
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-md border border-gray-200 p-6">
          <div className="text-4xl mb-3" aria-hidden="true">⚠️</div>
          <h1 className="text-lg font-bold text-gray-900 mb-2">
            Algo deu errado
          </h1>
          <p className="text-sm text-gray-600 mb-4">
            Ocorreu um erro inesperado no sistema. Suas alterações recentes podem
            não ter sido salvas. Por favor, recarregue a página para continuar.
          </p>
          {this.state.error?.message && (
            <details className="text-xs text-gray-400 mb-4">
              <summary className="cursor-pointer hover:text-gray-600">
                Detalhes técnicos
              </summary>
              <pre className="mt-2 p-2 bg-gray-50 rounded text-[10px] overflow-auto max-h-32">
                {this.state.error.message}
              </pre>
            </details>
          )}
          <button
            onClick={this.handleReload}
            className="w-full bg-brand-900 text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-blue-800 transition-colors"
          >
            Recarregar página
          </button>
        </div>
      </div>
    )
  }
}
