
import React, { useState } from 'react';
import { Channel, AgeGroup, Language } from '../types';
import { translations } from '../services/translations';

interface ChannelSetupProps {
  channel: Channel | null;
  onSave: (channel: Channel) => void;
  language: Language;
}

export const ChannelSetup: React.FC<ChannelSetupProps> = ({ channel, onSave, language }) => {
  const t = translations[language];
  const [formData, setFormData] = useState<Partial<Channel>>(
    channel || {
      name: '',
      niche: 'Mental Health',
      targetAge: 'Adults',
      description: ''
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: channel?.id || Date.now().toString(),
      name: formData.name || 'Untitled Channel',
      niche: formData.niche || 'General',
      targetAge: formData.targetAge as AgeGroup || 'Adults',
      description: formData.description || '',
      createdAt: channel?.createdAt || new Date().toISOString()
    });
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="bg-emerald-600 p-10 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24">
               <path d="M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M19,19H5V5H19V19M11,17H13V14H16V12H13V9H11V12H8V14H11V17Z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold relative z-10">{t.setup_title}</h2>
          <p className="text-emerald-100 mt-2 relative z-10">{t.setup_subtitle}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-10 space-y-8">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">{t.label_name}</label>
            <input
              type="text"
              required
              className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all shadow-sm"
              placeholder={t.placeholder_name}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">{t.label_niche}</label>
              <div className="relative">
                <select
                  className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none shadow-sm appearance-none bg-white pr-10"
                  value={formData.niche}
                  onChange={(e) => setFormData({ ...formData, niche: e.target.value })}
                >
                  <optgroup label={t.group_lifestyle}>
                    <option value="Mental Health">{t.niche_mental}</option>
                    <option value="Nutrition & Diet">{t.niche_nutrition}</option>
                    <option value="Fitness & Yoga">{t.niche_fitness}</option>
                  </optgroup>
                  <optgroup label={t.group_medical}>
                    <option value="Chronic Diseases">{t.niche_chronic}</option>
                    <option value="Senior Health">{t.niche_seniors}</option>
                    <option value="Pediatrics">{t.niche_pediatrics}</option>
                    <option value="Sexual Health">{t.niche_sexual}</option>
                  </optgroup>
                  <optgroup label={t.group_trending}>
                    <option value="Skincare">{t.niche_skincare}</option>
                    <option value="Herbal Medicine">{t.niche_herbal}</option>
                    <option value="Biohacking">{t.niche_biohacking}</option>
                  </optgroup>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  ▼
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">{t.label_age}</label>
              <div className="relative">
                <select
                  className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none shadow-sm appearance-none bg-white pr-10"
                  value={formData.targetAge}
                  onChange={(e) => setFormData({ ...formData, targetAge: e.target.value as AgeGroup })}
                >
                  <option value="Kids">{t.age_kids}</option>
                  <option value="Teens">{t.age_teens}</option>
                  <option value="Adults">{t.age_adults}</option>
                  <option value="Seniors">{t.age_seniors}</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  ▼
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">{t.label_desc}</label>
            <textarea
              className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none h-32 resize-none shadow-sm"
              placeholder={t.placeholder_desc}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <button
            type="submit"
            className="w-full py-5 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200 active:scale-[0.98] border-b-4 border-emerald-800"
          >
            {channel ? t.btn_update : t.btn_create}
          </button>
        </form>
      </div>
    </div>
  );
};
