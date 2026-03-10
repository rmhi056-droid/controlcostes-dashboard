import React, { useState } from 'react';
import { useData } from './hooks/useData';
import { TopBar } from './components/TopBar';
import { Sidebar, TabId } from './components/Sidebar';
import { ArenaMode } from './components/ArenaMode';
import { ConfiguracionTab } from './components/tabs/ConfiguracionTab';
import { MarketingTab } from './components/tabs/MarketingTab';
import { FunnelTab } from './components/tabs/FunnelTab';
import { RevenueMixTab } from './components/tabs/RevenueMixTab';
import { SalesPerformanceTab } from './components/tabs/SalesPerformanceTab';
import { ActivityTab } from './components/tabs/ActividadTab';
import { LossReasonsTab } from './components/tabs/LossReasonsTab';
import { SedesTab } from './components/tabs/SedesTab';
import { CohortsTab } from './components/tabs/CohortsTab';
import { SalesAnimation } from './components/SalesAnimation';
import { Loader2, AlertCircle } from 'lucide-react';


export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('Arena');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const {
    data,
    filteredData,
    loading,
    error,
    lastUpdated,
    filters,
    setFilters,
    metrics,
    filterOptions,
    handleFileUpload,
    loadData,
    config,
    setConfig
  } = useData();

  if (loading && !lastUpdated) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-500">
        <Loader2 className="animate-spin mb-4" size={48} />
        <p className="text-lg font-medium">Cargando datos del CRM...</p>
      </div>
    );
  }

  if (error && !lastUpdated) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-rose-500">
        <AlertCircle className="mb-4" size={48} />
        <p className="text-lg font-medium">Error al cargar datos</p>
        <p className="text-sm text-slate-500 mt-2">{error}</p>
        <button 
          onClick={loadData}
          className="mt-6 px-4 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  const renderContent = () => {

    switch (activeTab) {
      case 'Arena':
        return <ArenaMode data={filteredData} metrics={metrics} dateRange={filters.dateRange} config={config} />;
      case 'Marketing':
        return <div className="p-6"><MarketingTab data={filteredData} metrics={metrics} /></div>;
      case 'Funnel':
        return <div className="p-6"><FunnelTab data={filteredData} metrics={metrics} /></div>;
      case 'RevenueMix':
        return <div className="p-6"><RevenueMixTab metrics={metrics} data={filteredData} /></div>;
      case 'SalesPerformance':
        return <div className="p-6"><SalesPerformanceTab metrics={metrics} /></div>;
      case 'Activity':
        return <div className="p-6"><ActivityTab data={filteredData} metrics={metrics} /></div>;
      case 'LossReasons':
        return <div className="p-6"><LossReasonsTab metrics={metrics} /></div>;
      case 'Sedes':
        return <div className="p-6"><SedesTab data={filteredData} metrics={metrics} /></div>;
      case 'Cohorts':
        return <div className="p-6"><CohortsTab data={filteredData} metrics={metrics} /></div>;
      case 'Configuracion':
        return <div className="p-6"><ConfiguracionTab config={config} setConfig={setConfig} comerciales={filterOptions.comerciales} /></div>;
      default:
        return null;
    }
  };


  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden">
      <SalesAnimation data={data} config={config} />
      
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
      />
      
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <TopBar
          data={data}
          filters={filters}
          setFilters={setFilters}
          filterOptions={filterOptions}
          lastUpdated={lastUpdated}
          onRefresh={loadData}
          onUpload={handleFileUpload}
        />
        
        <main className="flex-1 overflow-y-auto bg-slate-50">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

