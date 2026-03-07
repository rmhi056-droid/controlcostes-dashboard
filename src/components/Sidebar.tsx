import React from 'react';
import { 
  LayoutDashboard, 
  Filter, 
  Activity, 
  Users, 
  Briefcase, 
  AlertTriangle, 
  CheckCircle, 
  Monitor,
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export type TabId = 'Arena' | 'Overview' | 'Funnel' | 'Canales' | 'Comerciales' | 'Soluciones' | 'Actividad' | 'Perdidas' | 'Calidad' | 'Configuracion';

interface SidebarProps {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export function Sidebar({ activeTab, setActiveTab, isOpen, setIsOpen }: SidebarProps) {
  const menuItems = [
    { id: 'Arena', label: 'La Arena', icon: Monitor, isPrimary: true },
    { id: 'Overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'Funnel', label: 'El Embudo', icon: Filter },
    { id: 'Canales', label: 'Canales', icon: Activity },
    { id: 'Comerciales', label: 'Comerciales', icon: Users },
    { id: 'Soluciones', label: 'Soluciones', icon: Briefcase },
    { id: 'Actividad', label: 'Actividad', icon: Activity },
    { id: 'Perdidas', label: 'Pérdidas', icon: AlertTriangle },
    { id: 'Calidad', label: 'Calidad', icon: CheckCircle },
  ];

  const bottomItems = [
    { id: 'Configuracion', label: 'Configuración', icon: Settings },
  ];

  return (
    <aside 
      className={`bg-[#674c65] text-white/80 flex flex-col transition-all duration-300 relative ${
        isOpen ? 'w-72' : 'w-20'
      }`}
    >
      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="absolute -right-3 top-6 bg-[#3d2c3c] text-white rounded-full p-1 shadow-lg hover:bg-[#2a1e29] z-50 border border-white/10"
      >
        {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </button>

      {/* Logo Area */}
      <div className="h-24 flex items-center justify-center border-b border-white/10 p-4">
        {isOpen ? (
          <div className="flex items-center gap-3 w-full px-2">
            <div className="flex flex-col leading-none text-white font-sans">
              <span className="text-[26px] font-medium tracking-wide">Control</span>
              <span className="text-[26px] font-medium tracking-wide">Costes</span>
            </div>
            <div className="w-1.5 h-12 bg-[#8c9496] rounded-sm mx-1 shrink-0"></div>
            <div className="flex flex-col leading-tight text-white font-sans text-[11px] font-light tracking-wide relative pt-2">
              <div className="absolute top-0 left-12 w-1.5 h-3 bg-[#4a7c24] rounded-sm"></div>
              <span>Expertos en gestión de empresas</span>
              <span>y optimización de costes</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col leading-tight text-white font-sans text-center">
            <span className="text-2xl font-medium">C</span>
            <span className="text-2xl font-medium">C</span>
          </div>
        )}
      </div>

      {/* Main Menu */}
      <div className="flex-1 overflow-y-auto py-6 flex flex-col gap-1 px-3">
        {isOpen && <div className="text-xs font-semibold text-white/50 mb-2 px-3 uppercase tracking-wider">Menú Principal</div>}
        
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as TabId)}
              className={`
                flex items-center gap-3 px-3 py-3 rounded-xl transition-all
                ${isActive 
                  ? item.isPrimary 
                    ? 'bg-[#3d2c3c] text-white shadow-lg border border-white/10' 
                    : 'bg-white/10 text-white' 
                  : 'hover:bg-white/5 hover:text-white'
                }
                ${!isOpen && 'justify-center'}
              `}
              title={!isOpen ? item.label : undefined}
            >
              <Icon size={20} className={isActive && !item.isPrimary ? 'text-white' : ''} />
              {isOpen && <span className="font-medium text-sm">{item.label}</span>}
            </button>
          );
        })}
      </div>

      {/* Bottom Menu */}
      <div className="p-3 border-t border-white/10">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as TabId)}
              className={`
                flex items-center gap-3 px-3 py-3 rounded-xl w-full transition-all
                ${isActive ? 'bg-white/10 text-white' : 'hover:bg-white/5 hover:text-white'}
                ${!isOpen && 'justify-center'}
              `}
              title={!isOpen ? item.label : undefined}
            >
              <Icon size={20} className={isActive ? 'text-white' : ''} />
              {isOpen && <span className="font-medium text-sm">{item.label}</span>}
            </button>
          );
        })}
      </div>
    </aside>
  );
}

