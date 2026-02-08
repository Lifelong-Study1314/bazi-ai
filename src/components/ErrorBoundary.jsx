import React from 'react'

/**
 * React Error Boundary — catches render errors in child components and
 * displays a graceful fallback instead of blanking the entire page.
 *
 * Usage:
 *   <ErrorBoundary language="en" label="Five Elements">
 *     <SomeComponent />
 *   </ErrorBoundary>
 */

const LABELS = {
  en: {
    title: 'Something went wrong',
    description: 'This section encountered an error and could not be displayed.',
    retry: 'Try Again',
  },
  'zh-TW': {
    title: '出現錯誤',
    description: '此區塊遇到問題，無法正常顯示。',
    retry: '重試',
  },
  'zh-CN': {
    title: '出现错误',
    description: '此区块遇到问题，无法正常显示。',
    retry: '重试',
  },
  ko: {
    title: '문제가 발생했습니다',
    description: '이 섹션에 오류가 발생하여 표시할 수 없습니다.',
    retry: '다시 시도',
  },
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error(`[ErrorBoundary${this.props.label ? ` — ${this.props.label}` : ''}]`, error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      const lang = this.props.language || 'en'
      const L = LABELS[lang] || LABELS.en
      const sectionLabel = this.props.label || ''

      return (
        <div className="rounded-xl border border-rose-500/20 bg-rose-950/10 p-5 text-center space-y-3">
          <div className="flex items-center justify-center gap-2 text-rose-300">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <span className="font-semibold text-sm">
              {L.title}{sectionLabel ? ` — ${sectionLabel}` : ''}
            </span>
          </div>
          <p className="text-xs text-rose-200/70">{L.description}</p>
          <button
            onClick={this.handleRetry}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-lg border border-rose-500/30 text-rose-200 hover:bg-rose-900/30 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
            </svg>
            {L.retry}
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
