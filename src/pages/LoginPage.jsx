import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function LoginPage() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const { login } = useAuth()
  const { showToast } = useToast()

  const [form, setForm]       = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const from = location.state?.from || '/'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.email, form.password)
      showToast('Login realizado com sucesso.')
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const inputCls = "w-full border border-[#C4CADB] rounded-lg px-4 py-3 text-sm bg-white text-[#0D1B35] focus:outline-none focus:border-[#1B4FA8] focus:ring-1 focus:ring-[#1B4FA8]/20"

  return (
    <div className="min-h-screen bg-[#F5F6F8] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-[#0D3278] flex items-center justify-center text-white text-xl font-extrabold mx-auto mb-4 shadow-lg">
            AS
          </div>
          <h1 className="text-2xl font-extrabold text-[#0D1B35]">ASDOKS</h1>
          <p className="text-sm text-[#A8AFBC] mt-1">Associação Dória de Karatê Shotokan</p>
        </div>

        <div className="bg-white border border-[#DDE1EA] rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-[#0D1B35] mb-5">Entrar no sistema</h2>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#A8AFBC] mb-1">
                Email
              </label>
              <input
                type="email"
                className={inputCls}
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="seu@email.com"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#A8AFBC] mb-1">
                Senha
              </label>
              <input
                type="password"
                className={inputCls}
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1B4FA8] text-white font-semibold py-3 rounded-lg mt-2 hover:bg-[#0D3278] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-[#A8AFBC] mt-6">
          Ranking ASDOKS Karatê · Fase 3
        </p>
      </div>
    </div>
  )
}