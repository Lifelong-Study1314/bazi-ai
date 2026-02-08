import React, { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'

const labels = {
  en: {
    login: 'Sign In', signup: 'Sign Up', email: 'Email', password: 'Password',
    name: 'Name (optional)', submit_login: 'Sign In', submit_signup: 'Create Account',
    switch_to_signup: "Don't have an account?", switch_to_login: 'Already have an account?',
    close: 'Close', error_prefix: 'Error',
  },
  'zh-TW': {
    login: '登入', signup: '註冊', email: '電子郵件', password: '密碼',
    name: '姓名（選填）', submit_login: '登入', submit_signup: '建立帳號',
    switch_to_signup: '還沒有帳號？', switch_to_login: '已有帳號？',
    close: '關閉', error_prefix: '錯誤',
  },
  'zh-CN': {
    login: '登录', signup: '注册', email: '电子邮件', password: '密码',
    name: '姓名（选填）', submit_login: '登录', submit_signup: '创建账号',
    switch_to_signup: '还没有账号？', switch_to_login: '已有账号？',
    close: '关闭', error_prefix: '错误',
  },
  ko: {
    login: '로그인', signup: '회원가입', email: '이메일', password: '비밀번호',
    name: '이름 (선택사항)', submit_login: '로그인', submit_signup: '계정 만들기',
    switch_to_signup: '계정이 없으신가요?', switch_to_login: '이미 계정이 있으신가요?',
    close: '닫기', error_prefix: '오류',
  },
}

const AuthModal = ({ isOpen, onClose, language = 'en', initialTab = 'login' }) => {
  const t = labels[language] || labels.en
  const { login, signup } = useAuth()

  const [tab, setTab] = useState(initialTab)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      if (tab === 'login') {
        await login(email, password)
      } else {
        await signup(email, password, name || null)
      }
      onClose()
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div
        className="relative w-full max-w-md mx-4 rounded-2xl border border-white/10 bg-bazi-surface shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-neutral-500 hover:text-amber-200 text-xl leading-none transition-colors"
          aria-label={t.close}
        >
          &times;
        </button>

        {/* Tabs */}
        <div className="flex border-b border-white/10">
          {['login', 'signup'].map(tb => (
            <button
              key={tb}
              onClick={() => { setTab(tb); setError('') }}
              className={`flex-1 py-3.5 text-sm font-semibold transition-all duration-200 ${
                tab === tb
                  ? 'text-bazi-gold border-b-2 border-bazi-gold bg-bazi-surface-soft/50'
                  : 'text-neutral-500 hover:text-amber-200'
              }`}
            >
              {tb === 'login' ? t.login : t.signup}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-900/30 border border-red-500/30 text-red-200 text-sm rounded-lg px-4 py-2.5">
              {t.error_prefix}: {error}
            </div>
          )}

          {tab === 'signup' && (
            <div>
              <label className="block text-xs text-neutral-400 mb-1.5 font-medium">{t.name}</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-neutral-800/60 border border-white/10 rounded-lg px-4 py-2.5 text-amber-50 placeholder-neutral-600 focus:border-bazi-gold/50 focus:outline-none transition-colors"
              />
            </div>
          )}

          <div>
            <label className="block text-xs text-neutral-400 mb-1.5 font-medium">{t.email}</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full bg-neutral-800/60 border border-white/10 rounded-lg px-4 py-2.5 text-amber-50 placeholder-neutral-600 focus:border-bazi-gold/50 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs text-neutral-400 mb-1.5 font-medium">{t.password}</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full bg-neutral-800/60 border border-white/10 rounded-lg px-4 py-2.5 text-amber-50 placeholder-neutral-600 focus:border-bazi-gold/50 focus:outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-bazi-gold text-bazi-ink font-bold rounded-lg hover:bg-bazi-gold-soft transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {submitting ? '...' : tab === 'login' ? t.submit_login : t.submit_signup}
          </button>

          <p className="text-center text-xs text-neutral-500">
            <button
              type="button"
              onClick={() => { setTab(tab === 'login' ? 'signup' : 'login'); setError('') }}
              className="text-bazi-gold hover:underline"
            >
              {tab === 'login' ? t.switch_to_signup : t.switch_to_login}
            </button>
          </p>
        </form>
      </div>
    </div>
  )
}

export default AuthModal
