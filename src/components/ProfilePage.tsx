/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User } from '../types';
import { Edit3, User as UserIcon, MapPin, Sparkles, Sliders, CheckCircle, FileText, Heart } from 'lucide-react';

interface ProfilePageProps {
  currentUser: User;
  onUpdateProfile: (avatarUrl: string, title: string, location: string, signature: string) => void;
}

const PRESET_AVATARS = [
  { name: 'Developer Boy', url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150' },
  { name: 'Designer Girl', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' },
  { name: 'Casual Gamer', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
  { name: 'Creative Director', url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150' },
  { name: 'Coding Hacker', url: 'https://images.unsplash.com/photo-1607990283143-e81e7a2c93ab?w=150' },
  { name: 'Retro Blogger', url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150' },
];

export default function ProfilePage({ currentUser, onUpdateProfile }: ProfilePageProps) {
  
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatarUrl);
  const [title, setTitle] = useState(currentUser.title);
  const [location, setLocation] = useState(currentUser.location);
  const [signature, setSignature] = useState(currentUser.signature);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(avatarUrl, title.trim(), location.trim(), signature.trim());
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3500);
  };

  const handleSelectPreset = (url: string) => {
    setAvatarUrl(url);
  };

  return (
    <div className="space-y-4" id="profile-page-wrapper">
      
      {/* Profile Title Header */}
      <div className="bg-gradient-to-b from-[#2b5a83] to-[#1c3c5a] text-white p-4 border-b-2 border-[#ff9900] shadow-sm">
        <h2 className="font-sans font-bold text-lg tracking-tight text-white">⚙️ Pannello di Controllo Utente (User CP)</h2>
        <p className="text-blue-100 text-xs mt-1">
          Personalizza la tua presenza digitale, modifica il tuo avatar visuale, imposta una firma BBCode o aggiorna il tuo titolo.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Instant Preview Card */}
        <div className="lg:col-span-4 space-y-4 select-none">
          <div className="bg-white p-5 rounded-sm border border-gray-300 shadow-sm text-center space-y-4">
            <h3 className="font-bold text-sm text-[#1c3c5a] border-b border-gray-200 pb-2">📂 Anteprima Profilo Board</h3>
            
            <div className="relative inline-block">
              <img
                src={avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                alt={currentUser.username}
                referrerPolicy="no-referrer"
                className="w-24 h-24 rounded-sm border border-gray-300 object-cover bg-white mx-auto shadow-inner"
              />
              <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-white bg-green-500 shadow" />
            </div>

            <div className="space-y-1">
              <h4 className="font-bold text-lg text-slate-850">{currentUser.username}</h4>
              <p className="text-xs font-bold text-amber-900 bg-amber-50 rounded-sm border border-amber-300/60 py-0.5 px-3 uppercase inline-block font-sans">
                {title || 'Membro Registrato'}
              </p>
              <p className="text-[10px] text-gray-400 font-mono">ID Account: {currentUser.id}</p>
            </div>

            {/* Micro Stats summary */}
            <div className="grid grid-cols-2 gap-2 bg-gray-50/70 p-3 rounded-sm border border-gray-200 font-sans">
              <div>
                <p className="text-lg font-bold text-[#1c3c5a] font-mono">{currentUser.postCount}</p>
                <p className="text-[9px] text-gray-400 uppercase font-bold">Post Inviati</p>
              </div>
              <div>
                <p className="text-lg font-bold text-amber-700 font-mono">{currentUser.likesCount}</p>
                <p className="text-[9px] text-gray-400 uppercase font-bold">Likes Ricevuti</p>
              </div>
            </div>

            {/* Join stamp */}
            <div className="text-[10px] text-gray-500 space-y-1 text-left font-sans pt-1">
              <div className="flex items-center gap-1.5 justify-between">
                <span>Data di iscrizione:</span>
                <strong className="text-gray-700">{currentUser.registeredAt}</strong>
              </div>
              <div className="flex items-center gap-1.5 justify-between">
                <span>Località dichiarata:</span>
                <strong className="text-gray-700 text-right truncate max-w-[130px]" title={location}>{location || 'Non specificata'}</strong>
              </div>
            </div>

          </div>
        </div>

        {/* Right Column: Settings Form and preset selector */}
        <div className="lg:col-span-8">
          <div className="bg-white p-6 rounded-sm border border-gray-300 shadow-sm space-y-6">
            
            {showSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-800 text-xs p-3 rounded-sm flex items-center gap-2">
                <CheckCircle size={14} className="text-green-600 stroke-[2.5]" />
                <span>Profilo salvato correttamente nel database locale! Le modifiche verranno mostrate immediatamente in tutti i tuoi post storici.</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5 font-sans text-xs text-left" id="user-cp-settings-form">
              
              {/* Preset selection widget */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#1c3c5a]">
                  Scegli un Avatar Veloce:
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                  {PRESET_AVATARS.map((preset, i) => (
                    <button
                      type="button"
                      key={i}
                      onClick={() => handleSelectPreset(preset.url)}
                      className={`p-1.5 rounded-sm border-2 transition-all hover:scale-105 bg-[#F4F8FC] ${
                        avatarUrl === preset.url ? 'border-[#ff9900] ring-1 ring-[#ff9900]' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-10 object-cover rounded-sm border border-gray-300"
                      />
                      <p className="text-[8px] text-gray-500 font-bold truncate text-center mt-1 pt-0.5">{preset.name}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* URL Custom avatar */}
              <div>
                <label className="block text-xs font-bold text-[#1c3c5a] mb-1">
                  O inserisci un URL Avatar Personalizzato:
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/mio_avatar.jpg"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="w-full text-xs p-2.5 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-[#ff9900] text-gray-800 bg-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Title Custom Input */}
                <div>
                  <label className="block text-xs font-bold text-[#1c3c5a] mb-1">
                    Titolo Utente Personalizzato (Sotto-Nome):
                  </label>
                  <input
                    type="text"
                    placeholder="Expert PHP Developer / Retro Lover"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={35}
                    className="w-full text-xs p-2.5 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-[#ff9900] text-gray-800 bg-white"
                  />
                  <p className="text-[9px] text-gray-400 mt-1">Massimo 35 caratteri. Sostituirà il grado predefinito.</p>
                </div>

                {/* Location Custom Input */}
                <div>
                  <label className="block text-xs font-bold text-[#1c3c5a] mb-1">
                    Località (Città, Paese):
                  </label>
                  <input
                    type="text"
                    placeholder="Milano, Italia"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    maxLength={25}
                    className="w-full text-xs p-2.5 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-[#ff9900] text-gray-800 bg-white"
                  />
                  <p className="text-[9px] text-gray-400 mt-1">Massimo 25 caratteri. Verrà mostrato a sinistra dei tuoi post.</p>
                </div>
              </div>

              {/* Signature Custom Input */}
              <div>
                <label className="block text-xs font-bold text-[#1c3c5a] mb-1">
                  La Tua Firma del Forum (Supporta BBCode):
                </label>
                <textarea
                  placeholder="Scrivi una firma statica. Es: [b]Luca Modding[/b] - Sviluppo plugin php [code]echo 'vB3 legacy';[/code]"
                  value={signature}
                  onChange={(e) => setSignature(e.target.value)}
                  rows={4}
                  className="w-full text-xs p-2.5 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-[#ff9900] text-gray-800 bg-white font-mono"
                />
                <p className="text-[9px] text-gray-400 mt-1">La firma comparirà separata da una riga tratteggiata sotto ognuno dei tuoi post ed è completamente formattabile.</p>
              </div>

              {/* Actions submit */}
              <div className="flex justify-end pt-3">
                <button
                  type="submit"
                  className="bg-gradient-to-b from-[#2b5a83] to-[#1c3c5a] hover:from-blue-600 hover:to-blue-800 text-white font-bold text-xs uppercase tracking-wide px-5 py-2.5 rounded-sm shadow-md border border-blue-950 cursor-pointer transition-all"
                  id="profile-save-btn"
                >
                  Salva Modifiche Profilo
                </button>
              </div>

            </form>

          </div>
        </div>

      </div>

    </div>
  );
}
