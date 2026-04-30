import { useState } from 'react'
import { NavLink } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/', label: 'Media Library', end: true },
  { to: '/auto-form-fill', label: 'Auto Form Fill' },
  { to: '/resume-review', label: 'Resume Review' },
  { to: '/feedback', label: 'Feedback' },
]

const linkClass = ({ isActive }) =>
  `px-3 py-1.5 text-sm rounded-[8px] transition-colors ${
    isActive ? 'bg-zinc-900 text-white md:text-[14px] text-[12px] !font-[400]' : 'text-zinc-600 hover:bg-zinc-100 md:text-[14px] text-[12px] !font-[400]'
  }`

const Navbar = () => {
  const [open, setOpen] = useState(false)

  return (
    <header className="bg-white border-b border-zinc-200 sticky top-0 z-40">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 md:py-[16px] py-[8px] flex items-center justify-between">
        <NavLink to="/" className="text-[18px] md:text-[24px] font-bold text-zinc-900" onClick={() => setOpen(false)}>
          Toolkit
        </NavLink>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-[8px]">
          {NAV_ITEMS.map(item => (
            <NavLink key={item.to} to={item.to} end={item.end} className={linkClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Mobile hamburger */}
        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen(o => !o)}
          className="md:hidden w-9 h-9 flex items-center justify-center rounded-[8px] border border-zinc-200 text-zinc-700 hover:bg-zinc-100 transition-colors"
        >
          {open ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav className="md:hidden border-t border-zinc-200 bg-white px-4 py-3 flex flex-col gap-[8px]">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setOpen(false)}
              className={linkClass}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  )
}

export default Navbar
