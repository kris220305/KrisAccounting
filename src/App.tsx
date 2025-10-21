import { useState } from 'react';
import OpeningScreen from './components/OpeningScreen';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import HomePage from './components/HomePage';
import ChartOfAccounts from './components/ChartOfAccounts';
import JournalEntries from './components/JournalEntries';
import GeneralLedger from './components/GeneralLedger';
import FinancialReports from './components/FinancialReports';

function App() {
  const [showOpening, setShowOpening] = useState(true);
  const [activeView, setActiveView] = useState('home');

  if (showOpening) {
    return <OpeningScreen onComplete={() => setShowOpening(false)} />;
  }

  const renderContent = () => {
    switch (activeView) {
      case 'home':
        return <HomePage />;
      case 'chart':
        return <ChartOfAccounts />;
      case 'journal':
        return <JournalEntries />;
      case 'ledger':
        return <GeneralLedger />;
      case 'reports':
        return <FinancialReports />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950">
      <Header />
      <div className="flex">
        <Dashboard activeView={activeView} onViewChange={setActiveView} />
        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
