/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Subforum, Thread, Post, User, Category, UserGroup } from '../types';
import { Pin, Lock, MessageSquare, ArrowLeft, PlusCircle, Sparkles, Send, FileText } from 'lucide-react';
import { formatForumDate } from '../utils';

interface SubforumPageProps {
  subforum: Subforum;
  category: Category | undefined;
  threads: Thread[];
  posts: Post[];
  users: User[];
  userGroups: UserGroup[];
  currentUser: User;
  onGoBack: () => void;
  onSelectThread: (threadId: string) => void;
  onAddNewThread: (title: string, content: string) => void;
}

type SortField = 'lastPostAt' | 'createdAt' | 'repliesCount' | 'viewsCount';

export default function SubforumPage({
  subforum,
  category,
  threads,
  posts,
  users,
  userGroups,
  currentUser,
  onGoBack,
  onSelectThread,
  onAddNewThread
}: SubforumPageProps) {
  
  const [isCreatingThread, setIsCreatingThread] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [sortField, setSortField] = useState<SortField>('lastPostAt');
  const [errorMsg, setErrorMsg] = useState('');

  // Get threads inside this subforum
  const subThreads = threads.filter(t => t.subforumId === subforum.id);

  // Sorting logic (Sticky threads ALWAYS stay at top!)
  const sortedThreads = [...subThreads].sort((a, b) => {
    if (a.isSticky && !b.isSticky) return -1;
    if (!a.isSticky && b.isSticky) return 1;

    switch (sortField) {
      case 'createdAt':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'repliesCount':
        return b.repliesCount - a.repliesCount;
      case 'viewsCount':
        return b.viewsCount - a.viewsCount;
      case 'lastPostAt':
      default:
        return new Date(b.lastPostAt).getTime() - new Date(a.lastPostAt).getTime();
    }
  });

  const handleSubmitThread = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      setErrorMsg('Inserisci un titolo per la discussione.');
      return;
    }
    if (newContent.trim().length < 10) {
      setErrorMsg('Il messaggio deve contenere almeno 10 caratteri.');
      return;
    }

    onAddNewThread(newTitle.trim(), newContent);
    // Reset state
    setNewTitle('');
    setNewContent('');
    setErrorMsg('');
    setIsCreatingThread(false);
  };

  // Quick helper to insert BBCode tags in the text area
  const insertBBCode = (tag: string) => {
    const textarea = document.getElementById('new-thread-textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);
    const selectedText = text.substring(start, end);

    let replacement = '';
    if (tag === 'b') replacement = `[b]${selectedText || 'testo in grassetto'}[/b]`;
    else if (tag === 'i') replacement = `[i]${selectedText || 'testo in corsivo'}[/i]`;
    else if (tag === 'u') replacement = `[u]${selectedText || 'testo sottolineato'}[/u]`;
    else if (tag === 'code') replacement = `[code]${selectedText || '// tuo codice qui'}[/code]`;
    else if (tag === 'quote') replacement = `[quote]${selectedText || 'citazione'}[/quote]`;

    setNewContent(before + replacement + after);
    textarea.focus();
  };

  return (
    <div className="space-y-4" id="subforum-page-view">
      
      {/* Breadcrumbs (Classic Nav tree) */}
      <div className="bg-[#f2f2f2] border border-gray-300 px-4 py-2.5 rounded-sm text-[11px] flex justify-between items-center gap-2 select-none shadow-sm">
        <div className="flex flex-wrap items-center gap-1.5 text-[#666]">
          <span className="hover:underline hover:text-black cursor-pointer" onClick={onGoBack}>
            Forum
          </span>
          <span>&raquo;</span>
          <span className="font-bold text-black">{category?.name || 'Area'}</span>
          <span>&raquo;</span>
          <span className="font-bold text-[#1c3c5a]">{subforum.name}</span>
        </div>
        
        <button 
          onClick={onGoBack} 
          className="text-[11px] bg-white hover:bg-slate-50 text-[#3e70a7] font-bold flex items-center gap-1 py-1 px-2.5 rounded-sm border border-gray-300 shadow-sm transition-all cursor-pointer"
          id="btn-back-to-home"
        >
          <ArrowLeft size={11} className="text-[#3e70a7]" /> Indice Forum
        </button>
      </div>

      {/* Subforum Title Banner */}
      <div className="bg-gradient-to-b from-[#2b5a83] to-[#1c3c5a] text-white p-4 border-b-2 border-[#ff9900] shadow-sm">
        <h2 className="font-sans font-bold text-lg tracking-tight text-white">{subforum.name}</h2>
        <p className="text-blue-100 text-xs mt-1">{subforum.description}</p>
      </div>

      {/* Page Controls: Create Thread Toggle & Thread Sorters */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 border border-[#a5cae4] shadow-sm">
        
        {/* Toggle Thread Create Form */}
        <button
          onClick={() => setIsCreatingThread(!isCreatingThread)}
          className="bg-[#3e70a7] hover:bg-blue-600 text-white font-bold text-xs uppercase tracking-wider px-4 py-2 border border-blue-800 rounded-sm flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          id="btn-new-thread-toggle"
        >
          <PlusCircle size={14} /> Apri Nuova Discussione
        </button>

        {/* Sort Controls */}
        <div className="flex items-center gap-2 text-xs text-[#555]">
          <span className="font-bold text-[11px]">Ordina per:</span>
          <select
            value={sortField}
            onChange={(e) => setSortField(e.target.value as SortField)}
            className="bg-white border border-gray-400 text-[#333] text-xs py-1 px-2 focus:outline-none focus:ring-1 focus:ring-[#ff9900]"
            id="thread-sort-select"
          >
            <option value="lastPostAt">Ultima risposta attiva</option>
            <option value="createdAt">Data di creazione</option>
            <option value="repliesCount">Numero risposte</option>
            <option value="viewsCount">Numero visualizzazioni</option>
          </select>
        </div>

      </div>

      {/* NEW THREAD FORM (vBulletin classic advanced editor styled) */}
      {isCreatingThread && (
        <div className="border-2 border-[#ff9900]/40 bg-[#FFFFFA] shadow-md overflow-hidden p-4 space-y-3" id="new-thread-editor-box">
          <div className="border-b border-dashed border-[#ff9900]/30 pb-2 text-xs flex justify-between items-center bg-[#FFFFE6] -mx-4 -mt-4 p-3 mb-2">
            <span className="font-bold text-[#1c3c5a] flex items-center gap-1">
              📝 Creazione discussione in: <span className="underline">{subforum.name}</span>
            </span>
            <button 
              onClick={() => setIsCreatingThread(false)}
              className="text-gray-500 hover:text-red-600 text-[11px] font-bold"
            >
              Annulla [X]
            </button>
          </div>

          <form onSubmit={handleSubmitThread} className="space-y-3 font-sans">
            {errorMsg && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-2.5 rounded-sm">
                ⚠️ {errorMsg}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Titolo della Discussione:
              </label>
              <input
                type="text"
                placeholder="Titolo chiaro e riassuntivo (es: 'Guida completa alla sicurezza PHP Laravel')"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                maxLength={85}
                className="w-full text-xs p-2.5 bg-white border border-gray-400 focus:outline-none focus:ring-1 focus:ring-[#ff9900] text-slate-800"
                id="new-thread-title-input"
              />
            </div>

            {/* BBCode Quick Access toolbar */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Testo del Messaggio:
              </label>
              
              {/* Toolbar Buttons */}
              <div className="bg-[#f2f2f2] border-t border-l border-r border-gray-300 p-1.5 flex flex-wrap items-center gap-1 text-[11px]">
                <button
                  type="button"
                  onClick={() => insertBBCode('b')}
                  className="bg-white hover:bg-slate-200 border border-gray-300 px-2 py-0.5 rounded-sm font-black font-sans text-slate-800 shadow-sm"
                  title="Grassetto"
                >
                  B
                </button>
                <button
                  type="button"
                  onClick={() => insertBBCode('i')}
                  className="bg-white hover:bg-slate-200 border border-gray-300 px-2 py-0.5 rounded-sm italic font-sans text-slate-800 shadow-sm"
                  title="Corsivo"
                >
                  I
                </button>
                <button
                  type="button"
                  onClick={() => insertBBCode('u')}
                  className="bg-white hover:bg-slate-200 border border-gray-300 px-2 py-0.5 rounded-sm underline font-sans text-slate-800 shadow-sm"
                  title="Sottolineato"
                >
                  U
                </button>
                <span className="w-[1px] h-4 bg-gray-300 mx-1" />
                <button
                  type="button"
                  onClick={() => insertBBCode('code')}
                  className="bg-white hover:bg-slate-200 border border-gray-300 px-1.5 py-0.5 rounded-sm font-mono text-xs text-blue-700 font-bold"
                  title="Codice"
                >
                  [Code]
                </button>
                <button
                  type="button"
                  onClick={() => insertBBCode('quote')}
                  className="bg-white hover:bg-slate-200 border border-gray-300 px-1.5 py-0.5 rounded-sm font-sans text-xs text-slate-700"
                  title="Citazione"
                >
                  "Citazione"
                </button>
                <span className="hidden sm:inline-block text-[10px] text-gray-500 ml-auto mr-1 select-none">
                  Tag BBCode standard vBulletin abilitati
                </span>
              </div>

              <textarea
                id="new-thread-textarea"
                rows={8}
                placeholder="Scrivi qui il post iniziale. Puoi formattare usando i pulsanti BBCode sopra..."
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                className="w-full text-xs p-2.5 bg-white border border-gray-300 rounded-b focus:outline-none focus:ring-1 focus:ring-[#ff9900] text-slate-800 font-mono"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-1.5">
              <button
                type="button"
                onClick={() => { setIsCreatingThread(false); setErrorMsg(''); }}
                className="bg-slate-100 border border-gray-300 hover:bg-slate-200 text-slate-700 text-xs px-4 py-2 rounded-sm font-bold transition-colors cursor-pointer"
              >
                Annulla
              </button>
              <button
                type="submit"
                className="bg-[#3e70a7] hover:bg-blue-600 text-white text-xs px-4 py-2 border border-blue-800 rounded-sm font-bold flex items-center gap-1.5 shadow transition-all cursor-pointer"
                id="btn-submit-new-thread"
              >
                <Send size={12} /> Pubblica Discussione
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Threads Board Listing Table (vBulletin Style Row Items) */}
      <div className="border border-[#a5cae4] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[650px] md:min-w-0">
            <thead>
              <tr className="bg-[#f2f2f2] text-[#666] text-[10px] font-bold uppercase border-b border-gray-300">
                <th className="py-2 px-4 w-12 text-center">Stato</th>
                <th className="py-2 px-3">Discussione / Autore</th>
                <th className="py-2 px-3 w-28 text-center border-l border-r border-gray-200">Risposte</th>
                <th className="py-2 px-3 w-24 text-center border-r border-gray-200">Visite</th>
                <th className="py-2 px-4 w-56">Ultima Risposta</th>
              </tr>
            </thead>
            <tbody>
              {sortedThreads.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 text-xs italic">
                    Nessuna discussione trovata in questo subforum. Avviane una tu facendo click su "Apri Nuova Discussione"!
                  </td>
                </tr>
              ) : (
                sortedThreads.map(thread => {
                  const starter = users.find(u => u.id === thread.userId);
                  const lastPoster = users.find(u => u.id === thread.lastPostUserId);
                  
                  // Sticky and locked states matching beautiful aesthetics
                  const rowBg = thread.isSticky ? 'bg-[#ff9900]/5 hover:bg-[#ff9900]/10' : 'bg-white hover:bg-[#eff4f8]';
                  const indicatorBorder = thread.isSticky ? 'border-[#ff9900]/20' : 'border-gray-100';

                  return (
                    <tr 
                      key={thread.id} 
                      className={`border-b ${indicatorBorder} cursor-pointer transition-colors ${rowBg}`}
                      onClick={() => onSelectThread(thread.id)}
                      id={`thread-row-${thread.id}`}
                    >
                      {/* Thread Status Icon cell */}
                      <td className="py-2 px-2 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="inline-flex justify-center items-center gap-1 mx-auto">
                          {thread.isSticky && (
                            <span className="text-amber-800 bg-amber-100 border border-amber-300 p-1.5 rounded-sm" title="In Evidenza / Pin">
                              <Pin size={11} className="transform rotate-45 stroke-[2.5]" />
                            </span>
                          )}
                          {thread.isLocked && (
                            <span className="text-red-700 bg-red-50 border border-red-200 p-1.5 rounded-sm" title="Discussione Chiusa / Locked">
                              <Lock size={11} className="stroke-[2.5]" />
                            </span>
                          )}
                          {!thread.isSticky && !thread.isLocked && (
                            <span className="text-blue-500 bg-blue-50 border border-blue-100 p-1.5 rounded-sm">
                              <FileText size={11} />
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Thread details */}
                      <td className="py-3 px-3">
                        <div className="space-y-0.5">
                          <span className={`font-sans font-bold text-sm text-[#2b5a83] hover:underline ${thread.isSticky ? 'text-amber-900' : ''}`} id={`thread-title-anchor-${thread.id}`}>
                            {thread.title}
                          </span>
                          <div className="text-[10px] text-gray-400 flex items-center gap-1">
                            <span>Avviata da</span>
                            <span className="font-bold text-gray-500 hover:underline">{starter ? starter.username : 'Ospite'}</span>
                            <span>&bull;</span>
                            <span>{formatForumDate(thread.createdAt)}</span>
                          </div>
                        </div>
                      </td>

                      {/* Replies */}
                      <td className="py-3 px-3 text-center text-xs font-semibold text-[#555] font-mono border-l border-r border-gray-100">
                        {thread.repliesCount}
                      </td>

                      {/* Views */}
                      <td className="py-3 px-3 text-center text-xs font-semibold text-[#555] font-mono border-r border-gray-100">
                        {thread.viewsCount}
                      </td>

                      {/* Last Reply Info */}
                      <td className="py-3 px-4 text-[10px] font-sans text-gray-500">
                        <div className="space-y-0.5 text-left" onClick={(e) => e.stopPropagation()}>
                          <div className="text-[11px] font-bold text-[#2b5a83]">
                            {lastPoster ? lastPoster.username : thread.lastPostUsername}
                          </div>
                          <div className="text-[9px] text-gray-400">
                            {formatForumDate(thread.lastPostAt)}
                          </div>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
