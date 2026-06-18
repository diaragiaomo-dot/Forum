/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Category, Subforum, User, AuditLog, UserGroup } from '../types';
import { ShieldAlert, Plus, Trash, Edit3, Settings, ShieldCheck, UserCheck, Calendar, Lock } from 'lucide-react';

interface AdminCPProps {
  currentUser: User;
  categories: Category[];
  subforums: Subforum[];
  users: User[];
  userGroups: UserGroup[];
  auditLogs: AuditLog[];
  onAddCategory: (name: string) => void;
  onDeleteCategory: (catId: string) => void;
  onAddSubforum: (name: string, desc: string, catId: string) => void;
  onDeleteSubforum: (subId: string) => void;
  onUpdateUserRole: (userId: string, role: string, customTitle: string) => void;
  onAddUser: (username: string, role: string) => void;
  onDeleteUser: (userId: string) => void;
  onAddUserGroup: (name: string, colorClass: string, isAdmin: boolean, isMod: boolean) => void;
  onDeleteUserGroup: (groupId: string) => void;
}

export default function AdminCP({
  currentUser,
  categories,
  subforums,
  users,
  userGroups,
  auditLogs,
  onAddCategory,
  onDeleteCategory,
  onAddSubforum,
  onDeleteSubforum,
  onUpdateUserRole,
  onAddUser,
  onDeleteUser,
  onAddUserGroup,
  onDeleteUserGroup
}: AdminCPProps) {

  // Active admin tab: 'structure' (Categories/Subforums) | 'users' (User Management) | 'audit' (Logs)
  const [adminTab, setAdminTab] = useState<'structure' | 'users' | 'groups' | 'audit'>('structure');

  // Add Category form
  const [newCatName, setNewCatName] = useState('');
  
  // Add Subforum form
  const [newSubName, setNewSubName] = useState('');
  const [newSubDesc, setNewSubDesc] = useState('');
  const [newSubCatId, setNewSubCatId] = useState(categories[0]?.id || '');

  // User edit state
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState<User['role']>('member');
  const [editTitle, setEditTitle] = useState('');

  const handleCreateCat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    onAddCategory(newCatName.trim());
    setNewCatName('');
  };

  const handleCreateSub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubName.trim() || !newSubCatId) return;
    onAddSubforum(newSubName.trim(), newSubDesc.trim(), newSubCatId);
    setNewSubName('');
    setNewSubDesc('');
  };

  const handleSaveUserEdit = (userId: string) => {
    onUpdateUserRole(userId, editRole, editTitle.trim());
    setSelectedUserId(null);
  };

  const handleUserSelectForEdit = (u: User) => {
    setSelectedUserId(u.id);
    setEditRole(u.role);
    setEditTitle(u.title);
  };

  return (
    <div className="space-y-6" id="admin-cp-wrapper">
      
      {/* Simulation / Admin Status Helper */}
      {currentUser.role !== 'admin' && (
        <div className="bg-[#fffdf4] border-2 border-[#ff9900]/45 text-slate-800 p-4 rounded-sm text-xs flex flex-wrap justify-between items-center gap-4 shadow-sm font-sans">
          <div className="flex items-center gap-2">
            <span className="text-lg">⚠️</span>
            <div>
              <p className="font-bold">Attenzione - Modalità Simulazione Sbloccata</p>
              <p>Attualmente sei loggato come <strong>{currentUser.username}</strong> ({currentUser.role}). Nei veri forum vBulletin non avresti accesso a queste impostazioni, ma qui puoi visualizzare, creare e cancellare categorie e gestire utenti liberamente a scopo dimostrativo!</p>
            </div>
          </div>
          <button 
            type="button"
            className="bg-[#3e70a7] hover:bg-blue-600 text-white px-2.5 py-1.5 rounded-sm font-bold text-[11px] select-none uppercase transition-colors pointer-events-auto"
            onClick={() => {
              // Select the admin user
              const adminUser = users.find(u => u.role === 'admin');
              if (adminUser) {
                // We'll let them simulate properly
                const selectElement = document.getElementById('user-simulator-select') as HTMLSelectElement;
                if (selectElement) {
                  selectElement.value = adminUser.id;
                  selectElement.dispatchEvent(new Event('change', { bubbles: true }));
                }
              }
            }}
          >
            Passa ad Admin Giacomo
          </button>
        </div>
      )}

      {/* Admin Panel Header Banner */}
      <div className="bg-gradient-to-b from-[#2b5a83] to-[#1c3c5a] text-white p-4 border-b-2 border-[#ff9900] shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h2 className="font-sans font-bold text-base md:text-lg tracking-wide text-white flex items-center gap-1.5">
            <ShieldCheck className="text-amber-400 stroke-[2.5]" size={20} /> Pannello di Amministrazione & CMS (vBAdmin CP)
          </h2>
          <p className="text-blue-100 text-xs">Gestisci database locale, ruolistica utenti, forum, categorie e visualizza logs del sistema.</p>
        </div>
        <div className="text-[10px] bg-sky-950/40 px-3 py-1.5 rounded-sm border border-sky-800 text-sky-100 font-mono">
          VB CORE RUNNING ON EXPR + REACT
        </div>
      </div>

      {/* Admin Workspace Tabs */}
      <div className="flex border-b border-gray-300 text-xs">
        <button
          onClick={() => setAdminTab('structure')}
          className={`px-4 py-2.5 font-bold transition-all border-t-2 ${
            adminTab === 'structure'
              ? 'bg-white text-black border-[#ff9900] border-l border-r border-t-2'
              : 'text-slate-500 hover:text-black border-transparent hover:bg-slate-50'
          }`}
          id="admin-tab-structure"
        >
          📂 Gestione Categorie & Forum
        </button>
        <button
          onClick={() => setAdminTab('users')}
          className={`px-4 py-2.5 font-bold transition-all border-t-2 ${
            adminTab === 'users'
              ? 'bg-white text-black border-[#ff9900] border-l border-r border-t-2'
              : 'text-slate-500 hover:text-black border-transparent hover:bg-slate-50'
          }`}
          id="admin-tab-users"
        >
          👤 Gestione Utenti
        </button>
        <button
          onClick={() => setAdminTab('groups')}
          className={`px-4 py-2.5 font-bold transition-all border-t-2 ${
            adminTab === 'groups'
              ? 'bg-white text-black border-[#ff9900] border-l border-r border-t-2'
              : 'text-slate-500 hover:text-black border-transparent hover:bg-slate-50'
          }`}
          id="admin-tab-groups"
        >
          👥 Gruppi Utente
        </button>
        <button
          onClick={() => setAdminTab('audit')}
          className={`px-4 py-2.5 font-bold transition-all border-t-2 ${
            adminTab === 'audit'
              ? 'bg-white text-black border-[#ff9900] border-l border-r border-t-2'
              : 'text-slate-500 hover:text-black border-transparent hover:bg-slate-50'
          }`}
          id="admin-tab-audit"
        >
          📝 Registri di Sistema (Audit Logs)
        </button>
      </div>

      {/* TAB CONTENT: STRUCTURE */}
      {adminTab === 'structure' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="admin-structure-tab">
          
          {/* Left Column: Categorie CRUD builder */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white p-4 rounded-sm border border-gray-300 shadow-sm space-y-4 text-xs">
              <h3 className="font-bold text-sm text-[#1c3c5a] border-b border-gray-200 pb-2 flex items-center justify-between">
                <span>➕ Aggiungi Categoria</span>
              </h3>
              
              <form onSubmit={handleCreateCat} className="space-y-3 font-sans">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Nome Categoria:</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g. 🛠️ Sezione Tecnica"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    className="w-full text-xs p-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-[#ff9900] text-gray-800 bg-white"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#3e70a7] hover:bg-blue-600 border border-blue-800 text-white py-1.5 rounded-sm font-bold transition-colors cursor-pointer"
                  id="admin-submit-cat-btn"
                >
                  Crea Categoria
                </button>
              </form>
            </div>

            {/* List and deletable categories */}
            <div className="bg-white p-4 rounded-sm border border-gray-300 shadow-sm space-y-3 text-xs">
              <h3 className="font-bold text-sm text-[#1c3c5a] border-b border-gray-200 pb-2">📋 Categorie Attuali</h3>
              
              <div className="divide-y divide-gray-150">
                {categories.map(cat => (
                  <div key={cat.id} className="py-2 px-2 flex justify-between items-center bg-gray-50/70 border border-gray-200 rounded-sm mb-1 font-sans hover:bg-gray-50 transition-colors">
                    <span className="font-bold text-gray-700">{cat.name}</span>
                    <button
                      onClick={() => {
                        if (window.confirm(`Sei sicuro di voler cancellare la categoria "${cat.name}"? Tutti i subforum collegati diventeranno disallineati.`)) {
                          onDeleteCategory(cat.id);
                        }
                      }}
                      className="text-red-600 hover:text-red-800 hover:bg-red-50 p-1 rounded-sm transition-all cursor-pointer border border-transparent hover:border-red-200"
                      title="Cancella Categoria"
                    >
                      <Trash size={11} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Forum Subforums CRUD builder */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white p-4 rounded-sm border border-gray-300 shadow-sm space-y-4 text-xs">
              <h3 className="font-bold text-sm text-[#1c3c5a] border-b border-gray-200 pb-2">➕ Aggiungi Sotto-Sezione (Forum)</h3>
              
              <form onSubmit={handleCreateSub} className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans">
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Nome Forum:</label>
                    <input
                      type="text"
                      required
                      placeholder="E.g. Guide & Documentazione PHP"
                      value={newSubName}
                      onChange={(e) => setNewSubName(e.target.value)}
                      className="w-full text-xs p-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-[#ff9900] text-gray-800 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Seleziona Categoria Genitore:</label>
                    <select
                      value={newSubCatId}
                      onChange={(e) => setNewSubCatId(e.target.value)}
                      className="w-full text-xs p-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-[#ff9900] text-gray-800 bg-white"
                    >
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Breve Descrizione (Sottotitolo):</label>
                    <textarea
                      required
                      placeholder="E.g. Raccoglitore di script, trucchi ed ottimizzazioni per server PHP..."
                      value={newSubDesc}
                      onChange={(e) => setNewSubDesc(e.target.value)}
                      rows={3}
                      className="w-full text-xs p-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-[#ff9900] text-gray-800 bg-white font-sans"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-[#1c3c5a] hover:bg-[#2b5a83] text-white py-2 rounded-sm font-bold border border-blue-950 shadow-sm transition-colors cursor-pointer"
                  >
                    Registra Sotto-Sezione Forum
                  </button>
                </div>
              </form>
            </div>

            {/* List and clean layouts of Subforums */}
            <div className="bg-white p-4 rounded-sm border border-gray-300 shadow-sm space-y-3 text-xs">
              <h3 className="font-bold text-sm text-[#1c3c5a] border-b border-gray-200 pb-2">📋 Configurazione Forum Attiva</h3>
              
              <div className="overflow-x-auto border border-gray-300 rounded-sm">
                <table className="w-full text-left font-sans text-xs">
                  <thead>
                    <tr className="bg-[#f2f2f2] border-b border-gray-300 text-gray-700 font-bold text-[10px] uppercase">
                      <th className="py-2.5 px-3">Nome Sotto-Sezione</th>
                      <th className="py-2.5 px-3">Categoria Associata</th>
                      <th className="py-2.5 px-3 text-center">Cancella</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {subforums.map(sub => {
                      const parentCat = categories.find(c => c.id === sub.categoryId);
                      return (
                        <tr key={sub.id} className="hover:bg-slate-50/70 text-[11px] text-gray-700">
                          <td className="py-2.5 px-3 font-semibold text-[#1c3c5a]">{sub.name}</td>
                          <td className="py-2.5 px-3 italic text-gray-500">{parentCat ? parentCat.name : 'Nessuna'}</td>
                          <td className="py-2.5 px-3 text-center">
                            <button
                              onClick={() => {
                                if (window.confirm(`Sei sicuro di voler rimuovere il forum "${sub.name}"? Tutti i thread associati andranno perduti.`)) {
                                  onDeleteSubforum(sub.id);
                                }
                              }}
                              className="text-red-500 hover:text-red-700 p-1 rounded-sm hover:bg-red-50 transition-colors cursor-pointer border border-transparent hover:border-red-100"
                            >
                              <Trash size={12} className="mx-auto" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* TAB CONTENT: USER MANAGEMENT */}
      {adminTab === 'users' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="admin-users-tab">
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white p-4 rounded-sm border border-gray-300 shadow-sm space-y-4 text-xs">
              <h3 className="font-bold text-sm text-[#1c3c5a] border-b border-gray-200 pb-2">➕ Crea Nuovo Utente</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const username = (form.elements.namedItem('username') as HTMLInputElement).value;
                const role = (form.elements.namedItem('role') as HTMLSelectElement).value;
                if (!username.trim()) return;
                onAddUser(username.trim(), role);
                form.reset();
              }} className="space-y-3 font-sans">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Nome Utente:</label>
                  <input
                    type="text"
                    name="username"
                    required
                    className="w-full text-xs p-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-[#ff9900] text-gray-800 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Ruolo:</label>
                  <select
                    name="role"
                    className="w-full text-xs p-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-[#ff9900] text-gray-800 bg-white"
                  >
                    {userGroups.map(g => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#1c3c5a] hover:bg-[#2b5a83] text-white py-2 rounded-sm font-bold shadow-sm transition-colors cursor-pointer border border-blue-950"
                >
                  Registra Utente
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="bg-white p-4 rounded-sm border border-gray-300 shadow-sm space-y-4 text-xs">
              <h3 className="font-bold text-sm text-[#1c3c5a] border-b border-gray-200 pb-2">📂 Gestione Titoli e Livelli dei Membri Iscritti</h3>
              
              <div className="overflow-x-auto border border-gray-300 rounded-sm">
                <table className="w-full text-left font-sans text-xs">
                  <thead>
                    <tr className="bg-[#f2f2f2] border-b border-gray-300 text-gray-750 font-bold text-[10px] uppercase">
                      <th className="py-2.5 px-3">Membro Iscritto</th>
                      <th className="py-2.5 px-3">Ruolo (Grado)</th>
                      <th className="py-2.5 px-3">Titolo Personalizzato</th>
                      <th className="py-2.5 px-3">Post Totali</th>
                      <th className="py-2.5 px-3 text-center">Modifica/Cancella</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 font-sans">
                    {users.map(u => {
                      const uGroup = userGroups.find(g => g.id === u.role) || { name: u.role, colorClass: 'text-gray-500 bg-gray-50' };
                      return (
                  <tr key={u.id} className="hover:bg-slate-50 text-xs text-gray-700">
                    <td className="py-2.5 px-3 font-bold text-gray-900 flex items-center gap-2">
                      <img src={u.avatarUrl} alt={u.username} className="w-6 h-6 rounded-full object-cover border border-gray-300" referrerPolicy="no-referrer" />
                      <span>{u.username}</span>
                    </td>
                    <td className="py-2.5 px-3 font-mono">
                      <span className={`px-2 py-0.5 rounded-sm text-[10px] uppercase font-bold border border-current ${uGroup.colorClass}`}>
                        {uGroup.name}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 italic font-semibold text-gray-600">{u.title || '(Nessuno)'}</td>
                    <td className="py-2.5 px-3 font-mono text-gray-500 font-bold">{u.postCount}</td>
                    <td className="py-2.5 px-3 text-center">
                      {selectedUserId === u.id ? (
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-1.5 p-2 bg-amber-50 rounded border border-amber-200 -mx-2">
                          <select
                            value={editRole}
                            onChange={(e) => setEditRole(e.target.value)}
                            className="bg-white border text-gray-800 rounded text-xs p-1"
                          >
                            {userGroups.map(g => (
                              <option key={g.id} value={g.id}>{g.name}</option>
                            ))}
                          </select>
                          <input
                            type="text"
                            placeholder="Titolo custom"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="bg-white border rounded text-xs p-1 h-7 text-slate-755"
                          />
                          <button
                            onClick={() => handleSaveUserEdit(u.id)}
                            className="bg-green-600 text-white rounded font-bold px-2 py-1 text-[10px]"
                          >
                            Salva
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleUserSelectForEdit(u)}
                            className="bg-white hover:bg-slate-50 border border-gray-300 rounded-sm font-bold text-[10px] py-1 px-2.5 flex items-center gap-1 cursor-pointer"
                          >
                            <Settings size={10} /> Gestisci
                          </button>
                          <button
                            onClick={() => {
                              if (u.id === currentUser.id) {
                                alert("Non puoi cancellare te stesso.");
                                return;
                              }
                              if (window.confirm('Cancellare questo utente?')) onDeleteUser(u.id);
                            }}
                            className="bg-white hover:bg-red-50 text-red-600 border border-gray-300 hover:border-red-200 rounded-sm font-bold text-[10px] py-1 px-2.5 flex items-center gap-1 cursor-pointer"
                          >
                            <Trash size={10} /> Cancella
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: GROUPS */}
      {adminTab === 'groups' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="admin-groups-tab">
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white p-4 rounded-sm border border-gray-300 shadow-sm space-y-4 text-xs">
              <h3 className="font-bold text-sm text-[#1c3c5a] border-b border-gray-200 pb-2">➕ Crea Nuovo Gruppo</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const name = (form.elements.namedItem('name') as HTMLInputElement).value;
                const colorClass = (form.elements.namedItem('colorClass') as HTMLSelectElement).value;
                if (!name.trim()) return;
                onAddUserGroup(name.trim(), colorClass, false, false);
                form.reset();
              }} className="space-y-3 font-sans">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Nome Gruppo:</label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full text-xs p-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-[#ff9900] text-gray-800 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Colore Interfaccia:</label>
                  <select
                    name="colorClass"
                    className="w-full text-xs p-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-[#ff9900] text-gray-800 bg-white"
                  >
                    <option value="text-blue-700 font-bold bg-blue-50">Utente (Blu)</option>
                    <option value="text-red-700 font-bold bg-red-50">Admin (Rosso)</option>
                    <option value="text-green-700 font-bold bg-green-50">Mod (Verde)</option>
                    <option value="text-amber-700 font-bold bg-amber-50">VIP (Arancione)</option>
                    <option value="text-fuchsia-700 font-bold bg-fuchsia-50">Special (Fucsia)</option>
                    <option value="text-gray-700 font-bold bg-gray-50">Base (Grigio)</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#1c3c5a] hover:bg-[#2b5a83] text-white py-2 rounded-sm font-bold shadow-sm transition-colors cursor-pointer border border-blue-950"
                >
                  Nuovo Gruppo
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="bg-white p-4 rounded-sm border border-gray-300 shadow-sm space-y-4 text-xs">
              <h3 className="font-bold text-sm text-[#1c3c5a] border-b border-gray-200 pb-2">👥 Lista Gruppi Utente</h3>
              <div className="overflow-x-auto border border-gray-300 rounded-sm">
                <table className="w-full text-left font-sans text-xs">
                  <thead>
                    <tr className="bg-[#f2f2f2] border-b border-gray-300 text-gray-750 font-bold text-[10px] uppercase">
                      <th className="py-2.5 px-3">Nome Gruppo</th>
                      <th className="py-2.5 px-3">Utenti Assegnati</th>
                      <th className="py-2.5 px-3">Admin</th>
                      <th className="py-2.5 px-3 text-center">Cancella</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 font-sans">
                    {userGroups.map(g => {
                      const count = users.filter(u => u.role === g.id).length;
                      return (
                        <tr key={g.id} className="hover:bg-slate-50 text-xs text-gray-700">
                          <td className="py-2.5 px-3 font-mono">
                            <span className={`px-2 py-0.5 rounded-sm text-[10px] uppercase font-bold border border-current ${g.colorClass}`}>
                              {g.name}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-bold text-gray-600">{count}</td>
                          <td className="py-2.5 px-3">
                            {g.isAdmin ? (
                              <span className="text-green-600 font-bold">Sì</span>
                            ) : (
                              <span className="text-gray-400">No</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <button
                              onClick={() => {
                                if (['admin', 'mod', 'member'].includes(g.id)) {
                                  alert('Non puoi cancellare i gruppi di sistema predefiniti.');
                                  return;
                                }
                                if (count > 0) {
                                  alert('Non puoi cancellare un gruppo che ha utenti associati. Spostali prima!');
                                  return;
                                }
                                if (window.confirm(`Cancellare il gruppo ${g.name}?`)) onDeleteUserGroup(g.id);
                              }}
                              className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors border border-transparent hover:border-red-200"
                            >
                              <Trash size={14} className="mx-auto" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: AUDIT LOGS */}
      {adminTab === 'audit' && (
        <div className="bg-white p-4 rounded-sm border border-gray-300 shadow-sm space-y-3 text-xs" id="admin-audit-log-tab">
          <h3 className="font-bold text-sm text-[#1c3c5a] border-b border-gray-200 pb-2">📂 Registro di Sicurezza e Controllo CMS</h3>
          <p className="text-gray-500 text-[11px] leading-relaxed">
            Ogni operazione effettuata da Amministratori o Moderatori (creazioni di sezioni, blocchi di discussioni, sticky pins di thread) viene catturata in questo log per ispezione del server.
          </p>

          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
            {auditLogs.length === 0 ? (
              <p className="text-gray-400 italic text-center py-6">Nessun registro presente.</p>
            ) : (
              auditLogs
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                .map(log => (
                  <div key={log.id} className="p-2.5 bg-[#FAF9F5] border-l-4 border-[#ff9900] rounded-sm text-[11px] grid grid-cols-1 md:grid-cols-12 gap-2 hover:bg-[#FAF6EC] transition-all font-sans border border-gray-200">
                    <div className="md:col-span-3 text-slate-500">
                      📅 {new Date(log.timestamp).toLocaleString('it-IT')}
                    </div>
                    <div className="md:col-span-3 font-semibold text-[#1c3c5a] flex items-center gap-1">
                      <span>👤</span> {log.username}
                    </div>
                    <div className="md:col-span-3 font-mono text-amber-900 font-bold uppercase">
                      [{log.action}]
                    </div>
                    <div className="md:col-span-3 text-gray-600 italic">
                      {log.target}
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      )}

    </div>
  );
}
