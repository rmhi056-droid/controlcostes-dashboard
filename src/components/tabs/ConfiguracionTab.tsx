import React, { useState } from 'react';
import { AppConfig } from '../../types';
import { Save, User, Target } from 'lucide-react';

interface ConfiguracionTabProps {
  config: AppConfig;
  setConfig: React.Dispatch<React.SetStateAction<AppConfig>>;
  comerciales: string[];
}

export function ConfiguracionTab({ config, setConfig, comerciales }: ConfiguracionTabProps) {
  const [localConfig, setLocalConfig] = useState<AppConfig>(config);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setConfig(localConfig);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handlePhotoChange = (comercial: string, url: string) => {
    setLocalConfig(prev => ({
      ...prev,
      comercialesPhotos: {
        ...prev.comercialesPhotos,
        [comercial]: url
      }
    }));
  };

  const handleMetaChange = (key: 'ingresos' | 'ganados', value: number) => {
    setLocalConfig(prev => ({
      ...prev,
      metas: {
        ...prev.metas,
        [key]: value
      }
    }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Configuración</h2>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 bg-teal-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-teal-700 transition-colors shadow-sm"
        >
          <Save size={18} />
          {saved ? 'Guardado!' : 'Guardar Cambios'}
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Target className="text-teal-500" />
            Metas Mensuales (Modo Arena)
          </h3>
          <p className="text-sm text-slate-500 mt-1">Configura los objetivos que se mostrarán en la pantalla de la Arena.</p>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Meta de Ingresos (€)</label>
            <input
              type="number"
              value={localConfig.metas.ingresos}
              onChange={(e) => handleMetaChange('ingresos', Number(e.target.value))}
              className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Meta de Cierres (Ganados)</label>
            <input
              type="number"
              value={localConfig.metas.ganados}
              onChange={(e) => handleMetaChange('ganados', Number(e.target.value))}
              className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <User className="text-teal-500" />
            Fotos de Comerciales
          </h3>
          <p className="text-sm text-slate-500 mt-1">Añade la URL de la foto para cada comercial. Se mostrará en el Leaderboard de la Arena.</p>
        </div>
        <div className="p-6">
          {comerciales.length === 0 ? (
            <p className="text-slate-500 italic">No hay comerciales en los datos actuales.</p>
          ) : (
            <div className="space-y-4">
              {comerciales.map(comercial => (
                <div key={comercial} className="flex items-center gap-4 p-4 border border-slate-100 rounded-xl bg-slate-50/30">
                  <div className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden flex-shrink-0 border-2 border-white shadow-sm">
                    {localConfig.comercialesPhotos[comercial] ? (
                      <img src={localConfig.comercialesPhotos[comercial]} alt={comercial} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-lg">
                        {comercial.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-bold text-slate-700 mb-1">{comercial}</label>
                    <input
                      type="text"
                      placeholder="https://ejemplo.com/foto.jpg"
                      value={localConfig.comercialesPhotos[comercial] || ''}
                      onChange={(e) => handlePhotoChange(comercial, e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
