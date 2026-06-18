/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Subforum, Thread, Post, User, UserGroup } from '../types';
import { Search, FileText, ArrowRight, MessageSquare, ShieldAlert } from 'lucide-react';
import { formatForumDate } from '../utils';

interface SearchPageProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  threads: Thread[];
  posts: Post[];
  users: User[];
  userGroups: UserGroup[];
  subforums: Subforum[];
  onSelectThread: (threadId: string) => void;
}

export default function SearchPage({
  searchQuery,
  setSearchQuery,
  threads,
  posts,
  users,
  userGroups,
  subforums,
  onSelectThread
}: SearchPageProps) {

  // Search logic
  const query = searchQuery.trim().toLowerCase();

  // Find threads where title contains query
  const matchedThreads = query
    ? threads.filter(t => t.title.toLowerCase().includes(query))
    : [];

  // Find posts where content contains query
  const matchedPosts = query
    ? posts.filter(p => p.content.toLowerCase().includes(query))
    : [];

  // Filter out posts that belong to threads already matched, or vice versa if preferred,
  // but let's list them cleanly as separate matches (Thread Titles first, then Post Matches) so it's a very advanced forum indexing visual!

  // Highlight helper
  const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim()) return <span>{text}</span>;
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
      <span>
        {parts.map((p, i) => 
          p.toLowerCase() === highlight.toLowerCase()
            ? <mark key={i} className="bg-yellow-200 text-slate-900 font-bold rounded-sm px-0.5">{p}</mark>
            : p
        )}
      </span>
    );
  };

  return (
    <div className="space-y-4 font-sans" id="search-page-wrapper">
      
      {/* Visual Title Header */}
      <div className="bg-gradient-to-b from-[#2b5a83] to-[#1c3c5a] text-white p-4 border-b-2 border-[#ff9900] shadow-sm">
        <h2 className="font-sans font-bold text-lg tracking-tight text-white">🔍 Strumento di Ricerca Avanzato vBulletin</h2>
        <p className="text-blue-100 text-xs mt-1">
          Cerca instantaneamente risposte, codici e argomenti pubblicati dagli utenti nell'intero database del CMS.
        </p>
      </div>

      {/* Embedded Search Form */}
      <div className="bg-white p-4 border border-gray-300 rounded-sm shadow-sm space-y-3">
        <div className="flex bg-[#fcfcfc] rounded-sm border border-gray-300 overflow-hidden focus-within:ring-1 focus-within:ring-[#ff9900]">
          <input
            type="text"
            placeholder="Digita qualcosa da ricercare... (es: 'PHP', 'Regolamento', 'retro')"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs p-3 focus:outline-none bg-white font-sans text-gray-800"
            id="search-page-input-field"
          />
          <div className="bg-gray-100 flex items-center justify-center px-4 text-gray-500 border-l border-gray-300">
            <Search size={15} />
          </div>
        </div>
        <p className="text-[10px] text-gray-400 italic">La ricerca è insensibile alle maiuscole/minuscole e scansiona il titolo e il corpo di tutti i messaggi nell'indexedDB locale.</p>
      </div>

      {/* Result listing */}
      {!query ? (
        <div className="bg-[#fbfcff] border border-gray-300 text-gray-800 p-8 text-center rounded-sm text-xs select-none">
          <Search size={22} className="mx-auto text-[#1c3c5a] mb-2" />
          <p className="font-bold text-sm text-[#1c3c5a]">Nessuna keyword inserita</p>
          <p className="text-gray-500 mt-1 max-w-sm mx-auto font-sans">Digita alcune parole chiave nella casella sovrastante o nella barra in alto per cercare discussioni e risposte.</p>
        </div>
      ) : (
        <div className="space-y-4 text-xs text-left">
          
          {/* Matches count indicator */}
          <div className="text-gray-600 font-bold bg-[#f2f2f2] py-1.5 px-3 rounded-sm border border-gray-300 select-none text-[11px]">
            Risultati della ricerca per: <span className="text-[#1c3c5a] underline">"{query}"</span> — Trovate <span className="text-[#1c3c5a]">{matchedThreads.length} discussioni</span> e <span className="text-[#1c3c5a]">{matchedPosts.length} risposte</span> corrispondenti.
          </div>

          {/* SECTION 1: MATCHED THREAD TITLES */}
          {matchedThreads.length > 0 && (
            <div className="border border-gray-300 bg-white rounded-sm overflow-hidden shadow-xs">
              <div className="bg-[#f2f2f2] text-[#1c3c5a] font-sans font-bold p-2 px-3 border-b border-gray-300 text-[11px] uppercase tracking-wider select-none">
                📁 Discussioni Corrispondenti
              </div>
              <div className="divide-y divide-gray-200">
                {matchedThreads.map(t => {
                  const author = users.find(u => u.id === t.userId);
                  const sub = subforums.find(s => s.id === t.subforumId);
                  return (
                    <div 
                      key={t.id} 
                      className="p-3 hover:bg-slate-50 cursor-pointer font-sans flex items-start justify-between gap-4 transition-all"
                      onClick={() => onSelectThread(t.id)}
                      id={`search-thread-item-${t.id}`}
                    >
                      <div className="space-y-1">
                        <span className="font-bold text-xs text-[#1c3c5a] hover:underline flex items-center gap-1.5 leading-snug">
                          📄 {highlightText(t.title, query)}
                        </span>
                        <p className="text-[10px] text-gray-500">
                          Inserita da <strong>{author ? author.username : 'Ospite'}</strong> in <span className="italic font-bold text-[#3e70a7]">{sub ? sub.name : 'Forum'}</span> • {formatForumDate(t.createdAt)}
                        </p>
                      </div>
                      <span className="text-[10px] font-bold text-[#1c3c5a] bg-white hover:bg-slate-50 px-2 py-1.5 rounded-sm border border-gray-300 flex items-center gap-1 shrink-0 shadow-sm">
                        Leggi Discussione <ArrowRight size={10} />
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECTION 2: MATCHED POST CONTENT */}
          {matchedPosts.length > 0 && (
            <div className="border border-gray-300 bg-white rounded-sm overflow-hidden shadow-xs">
              <div className="bg-[#f2f2f2] text-[#1c3c5a] font-sans font-bold p-2 px-3 border-b border-gray-300 text-[11px] uppercase tracking-wider select-none">
                💬 Messaggi & Risposte Corrispondenti
              </div>
              <div className="divide-y divide-gray-200">
                {matchedPosts.map(p => {
                  const author = users.find(u => u.id === p.userId);
                  const parentThread = threads.find(t => t.id === p.threadId);
                  
                  if (!parentThread) return null; // skip orphan posts in simulation

                  // Locate character match to show a small relevant snippet of message
                  const idx = p.content.toLowerCase().indexOf(query);
                  const startPos = Math.max(0, idx - 60);
                  const endPos = Math.min(p.content.length, idx + 100);
                  const snippet = p.content.substring(startPos, endPos);
                  const fullSnippet = `${startPos > 0 ? '...' : ''}${snippet}${endPos < p.content.length ? '...' : ''}`;

                  return (
                    <div 
                      key={p.id} 
                      className="p-3.5 hover:bg-slate-50 cursor-pointer font-sans flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
                      onClick={() => onSelectThread(p.threadId)}
                      id={`search-post-item-${p.id}`}
                    >
                      <div className="space-y-1 flex-1 min-w-0">
                        <span className="font-bold text-[11px] text-[#2b5a83] ">
                          Discussione: <span className="text-gray-800 font-bold underline hover:text-[#1c3c5a]">{parentThread.title}</span>
                        </span>
                        <div className="text-[11px] font-mono text-gray-600 bg-gray-50 border border-gray-200 p-2.5 rounded-sm max-w-2xl break-words italic select-all leading-normal">
                          "{highlightText(fullSnippet, query)}"
                        </div>
                        <p className="text-[10px] text-gray-400">
                          Risposta di <strong>{author ? author.username : p.userId}</strong> • {formatForumDate(p.createdAt)}
                        </p>
                      </div>
                      <span className="text-[10px] font-bold text-gray-700 bg-white hover:bg-slate-50 border border-gray-300 px-2.5 py-1.5 rounded-sm flex items-center gap-1 self-end sm:self-center shrink-0 shadow-sm">
                        Vai al Messaggio <ArrowRight size={10} />
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* No matches */}
          {matchedThreads.length === 0 && matchedPosts.length === 0 && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-6 text-center rounded-sm select-none">
              <ShieldAlert size={18} className="mx-auto text-red-500 mb-1" />
              <p className="font-bold font-sans">Nessun elemento corrispondente trovato</p>
              <p className="text-gray-500 mt-0.5 font-sans">La ricerca non ha prodotto risultati. Prova con termini diversi, parole più corte o rami d'argomento generici.</p>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
