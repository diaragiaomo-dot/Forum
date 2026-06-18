/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, UserGroup } from '../types';
import { Shield, User as UserIcon, LogIn, Users, Search, AppWindow, Settings, LogOut } from 'lucide-react';

interface HeaderProps {
  currentUser: User;
  users: User[];
  userGroups: UserGroup[];
  onSelectUser: (user: User) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function Header({
  currentUser,
  users,
  userGroups,
  onSelectUser,
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery
}: HeaderProps) {
  
  const handleLogoClick = () => {
    setActiveTab('forum');
  };

  const currentYear = new Date().getFullYear();

  return (
    <header className="bg-[#e1e1e2] select-none">
      {/* Top Bar - Quick Settings & Account Simulation */}
      <div className="bg-[#1c3c5a] text-white text-[11px] px-6 py-2 flex flex-wrap justify-between items-center border-b border-[#0a1e30] gap-2">
        <div className="flex items-center gap-4">
          <span className="font-mono text-[10px] text-blue-300">
            Fuso Orario: Europe/Rome | Ora Locale: {new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
          </span>
          <span className="hidden sm:inline-block h-3 w-[1px] bg-blue-800" />
          <span className="hidden sm:inline-block text-blue-100 font-medium">
            Benvenuto, <strong className="text-blue-300">{currentUser.username}</strong> ({currentUser.role === 'admin' ? 'Amministratore' : currentUser.role === 'mod' ? 'Moderatore' : 'Utente Reg'})
          </span>
        </div>
        
        {/* Role Simulator Tool */}
        <div className="flex items-center gap-2 bg-[#2b5a83] px-2 py-0.5 rounded border border-[#0a1e30] shadow-inner">
          <span className="text-[10px] font-bold text-gray-200 uppercase tracking-wider hidden md:inline">
            ⚙️ Switch Utente per Demo:
          </span>
          <select
            value={currentUser.id}
            onChange={(e) => {
              const selected = users.find(u => u.id === e.target.value);
              if (selected) {
                onSelectUser(selected);
              }
            }}
            className="bg-[#1c3c5a] text-white text-[11px] font-semibold border border-[#a5cae4] rounded focus:outline-none focus:ring-1 focus:ring-[#ff9900] py-0.5 px-1.5 cursor-pointer max-w-[170px]"
            id="user-simulator-select"
          >
            {users.map(u => {
              const uG = userGroups.find(g => g.id === u.role) || { name: u.role };
              return (
               <option key={u.id} value={u.id} className="bg-[#1c3c5a]">
                {u.username} [{uG.name}]
              </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Main Brand Banner */}
      <div className="bg-gradient-to-b from-[#2b5a83] to-[#1c3c5a] px-6 py-6 border-b-2 border-[#ff9900] flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm">
        {/* Logo vBulletin Style */}
        <div className="flex items-center gap-3 cursor-pointer group" onClick={handleLogoClick}>
          <div className="bg-gradient-to-br from-[#1c3c5a] to-[#0a1e30] text-white font-serif font-extrabold text-3xl px-4 py-2 rounded border-2 border-[#a5cae4] flex items-center shadow-md tracking-tighter transform group-hover:scale-102 transition-all">
            <span className="text-[#ff9900]">v</span>
            <span>B</span>
            <span className="font-sans text-[10px] font-semibold self-end bg-[#ff9900] text-[#1c3c5a] px-1 rounded ml-1 mb-1 shadow">
              4.2.5
            </span>
          </div>
          <div>
            <h1 className="text-white font-sans font-bold text-3xl tracking-tighter italic">
              vB-PHP Forum <span className="text-xs font-normal align-top text-gray-300 font-sans not-italic">v4.2.5</span>
            </h1>
            <p className="text-blue-100 text-xs">
              La tua community di riferimento per lo sviluppo PHP & React
            </p>
          </div>
        </div>

        {/* Dynamic Search Box integrated */}
        <div className="w-full md:w-80 flex items-center bg-white rounded-sm border border-gray-400 overflow-hidden focus-within:ring-1 focus-within:ring-[#ff9900] shadow-sm transition-all">
          <input
            type="text"
            placeholder="Cerca parole chiave nel forum..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              // Auto-switch to search tab if they type
              if (activeTab !== 'search' && e.target.value.length >= 1) {
                setActiveTab('search');
              }
            }}
            className="w-full text-xs px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none"
            id="global-search-input"
          />
          <button
            onClick={() => setActiveTab('search')}
            className="bg-[#3e70a7] text-white px-3 py-2 border-l border-blue-800 hover:bg-blue-600 transition-colors text-xs font-semibold"
            title="Cerca"
            id="search-btn-trigger"
          >
            Search
          </button>
        </div>
      </div>

      {/* Retro Navigation Tabs Bar */}
      <div className="bg-[#f2f2f2] border-b border-gray-300 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-between items-center text-[11px] text-[#666]">
          <nav className="flex flex-wrap items-center">
            <button
              id="nav-tab-forum"
              onClick={() => { setActiveTab('forum'); setSearchQuery(''); }}
              className={`px-4 py-3 font-bold uppercase tracking-wider border-r border-gray-200 transition-all flex items-center gap-1.5 ${
                activeTab === 'forum'
                  ? 'bg-white text-black border-t-2 border-[#ff9900]'
                  : 'text-[#555] hover:bg-white hover:text-black'
              }`}
            >
              🏠 Forum
            </button>
            <button
              id="nav-tab-members"
              onClick={() => setActiveTab('members')}
              className={`px-4 py-3 font-bold uppercase tracking-wider border-r border-gray-200 transition-all flex items-center gap-1.5 ${
                activeTab === 'members'
                  ? 'bg-white text-black border-t-2 border-[#ff9900]'
                  : 'text-[#555] hover:bg-white hover:text-black'
              }`}
            >
              👥 Membri
            </button>
            <button
              id="nav-tab-profile"
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-3 font-bold uppercase tracking-wider border-r border-gray-200 transition-all flex items-center gap-1.5 ${
                activeTab === 'profile'
                  ? 'bg-white text-black border-t-2 border-[#ff9900]'
                  : 'text-[#555] hover:bg-white hover:text-black'
              }`}
            >
              👤 Il Mio Profilo
            </button>
            <button
              id="nav-tab-admin"
              onClick={() => setActiveTab('admin')}
              className={`px-4 py-3 font-bold uppercase tracking-wider border-r border-gray-200 transition-all flex items-center gap-1.5 ${
                activeTab === 'admin'
                  ? 'bg-white text-black border-t-2 border-[#ff9900]'
                  : 'text-[#555] hover:bg-white hover:text-black'
              }`}
            >
              🔒 Admin CP {currentUser.role !== 'admin' && <span className="text-[9px] text-amber-600 font-normal">(Demo)</span>}
            </button>
          </nav>

          {/* User Signout or Fast Actions */}
          <div className="flex items-center gap-3 py-1.5 md:py-0 text-[#666] text-[11px]">
            <span className="hidden lg:inline">
              Registrato il: <strong className="text-[#333]">{currentUser.registeredAt}</strong>
            </span>
            <span className="hidden lg:inline text-gray-300">|</span>
            <button
              onClick={() => setActiveTab('profile')}
              className="hover:text-black hover:border-black transition-colors flex items-center gap-1 font-bold bg-[#fcfcfc] px-2.5 py-1 rounded-sm border border-gray-300"
              id="header-profile-btn"
            >
              <Settings size={12} className="text-[#3e70a7]" /> Impostazioni
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
