import { useState } from 'react'
import Sidebar from './components/ui/Sidebar'
import Dashboard from './pages/Dashboard'
import TeamView from './pages/TeamView'
import CaseView from './pages/CaseView'
import ClientSuccessView from './pages/ClientSuccessView'
import './App.css'

const PAGES = {
  dashboard: <Dashboard />,
  team: <TeamView />,
  cases: <CaseView />,
  clients: <ClientSuccessView />,
}

const NAV_ITEMS = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    key: 'team',
    label: 'Team',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    key: 'cases',
    label: 'Cases',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  {
    key: 'clients',
    label: 'Customers',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
  },
]

function App() {
  const [activePage, setActivePage] = useState('dashboard')

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F6FB]">

      {/* Header */}
      <header className="bg-[#1E3480] px-4 md:px-8 py-4 flex items-center justify-between shadow-md shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 bg-[#E8A020] rounded-full" />
          <span className="text-white font-bold tracking-widest text-sm uppercase">
            Demo Law Firm
          </span>
        </div>
        <span className="hidden md:block text-white/50 text-xs tracking-wider">Demo Law Firm</span>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop sidebar */}
        <Sidebar active={activePage} onChange={setActivePage} />

        {/* Main content — extra bottom padding on mobile for bottom nav */}
        <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
          {PAGES[activePage]}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50 flex">
        {NAV_ITEMS.map((item) => {
          const isActive = activePage === item.key
          return (
            <button
              key={item.key}
              onClick={() => setActivePage(item.key)}
              className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-1 transition-colors ${
                isActive ? 'text-[#1E3480]' : 'text-gray-400'
              }`}
            >
              {item.icon}
              <span className="text-[10px] font-semibold tracking-wide">{item.label}</span>
              {isActive && <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[#E8A020]" />}
            </button>
          )
        })}
      </nav>

    </div>
  )
}

export default App
