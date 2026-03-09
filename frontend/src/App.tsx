import { Layout } from '@/components/layout/Layout';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { ArbitragePage } from '@/components/arbitrage/ArbitragePage';
import { LiquidationPage } from '@/components/liquidation/LiquidationPage';
import { AgentPage } from '@/components/agent/AgentPage';
import { SettingsPage } from '@/components/settings/SettingsPage';
import { useStore } from '@/store/useStore';

function App() {
  const { currentPage } = useStore();

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard />;
      case 'arbitrage': return <ArbitragePage />;
      case 'liquidation': return <LiquidationPage />;
      case 'agent': return <AgentPage />;
      case 'settings': return <SettingsPage />;
      default: return <Dashboard />;
    }
  };

  return (
    <Layout>
      {renderPage()}
    </Layout>
  );
}

export default App;
