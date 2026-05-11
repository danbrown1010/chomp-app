export function IconHome({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 10.5L12 3L21 10.5V20C21 20.55 20.55 21 20 21H15V15H9V21H4C3.45 21 3 20.55 3 20V10.5Z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" fill="none" />
    </svg>
  )
}

export function IconMap({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z" stroke="currentColor" strokeWidth="1.75" fill="none" strokeLinejoin="round" />
      <circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.75" fill="none" />
    </svg>
  )
}

export function IconFlame({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C12 2 7 7 7 13C7 15.76 9.24 18 12 18C14.76 18 17 15.76 17 13C17 10.5 15.5 8.5 15.5 8.5C15.5 8.5 15 10 13.5 10.5C14 9 13.5 5.5 12 2Z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" fill="none" />
      <path d="M9.5 14.5C9.5 16 10.62 17 12 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function IconSignal({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      <path d="M8.5 15.5C7.57 14.57 7 13.35 7 12C7 10.65 7.57 9.43 8.5 8.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" fill="none" />
      <path d="M15.5 8.5C16.43 9.43 17 10.65 17 12C17 13.35 16.43 14.57 15.5 15.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" fill="none" />
      <path d="M5.5 18.5C3.95 16.95 3 14.58 3 12C3 9.42 3.95 7.05 5.5 5.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" fill="none" />
      <path d="M18.5 5.5C20.05 7.05 21 9.42 21 12C21 14.58 20.05 16.95 18.5 18.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" fill="none" />
    </svg>
  )
}

export function IconMore({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <circle cx="5" cy="12" r="1.75" />
      <circle cx="12" cy="12" r="1.75" />
      <circle cx="19" cy="12" r="1.75" />
    </svg>
  )
}
