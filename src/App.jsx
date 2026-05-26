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

function App() {
  const [activePage, setActivePage] = useState('dashboard')

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F6FB]">

      {/* Header */}
      <header className="bg-[#1E3480] px-8 py-4 flex items-center justify-between shadow-md shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 bg-[#E8A020] rounded-full" />
          <span className="text-white font-bold tracking-widest text-sm uppercase">
            Demo Law Firm
          </span>
        </div>
        <span className="text-white/50 text-xs tracking-wider">Demo Law Firm</span>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar active={activePage} onChange={setActivePage} />
        <main className="flex-1 overflow-y-auto">
          {PAGES[activePage]}
        </main>
      </div>

    </div>
  )
}

export default App
