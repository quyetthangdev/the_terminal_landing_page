const base = 'inline-flex items-center justify-center w-[18px] h-[18px] rounded-full flex-shrink-0'

export const ToastSuccessIcon = () => (
  <span className={`${base} bg-emerald-500`}>
    <svg width="10" height="9" viewBox="0 0 10 9" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 4.5L3.5 7L9 1.5"/>
    </svg>
  </span>
)

export const ToastWarningIcon = () => (
  <span className={`${base} bg-amber-400`}>
    <svg width="3" height="9" viewBox="0 0 3 9" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
      <path d="M1.5 1v4M1.5 7.5v.01"/>
    </svg>
  </span>
)

export const ToastErrorIcon = () => (
  <span className={`${base} bg-red-500`}>
    <svg width="9" height="9" viewBox="0 0 9 9" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
      <path d="M1.5 1.5l6 6M7.5 1.5l-6 6"/>
    </svg>
  </span>
)

export const ToastInfoIcon = () => (
  <span className={`${base} bg-blue-500`}>
    <svg width="3" height="9" viewBox="0 0 3 9" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
      <path d="M1.5 1.5v.01M1.5 3.5v4"/>
    </svg>
  </span>
)

export const ToastAddIcon = () => (
  <span className={`${base} bg-[#C9A84C]`}>
    <svg width="9" height="9" viewBox="0 0 9 9" fill="none" stroke="#1a1000" strokeWidth="2.5" strokeLinecap="round">
      <path d="M4.5 1v7M1 4.5h7"/>
    </svg>
  </span>
)
