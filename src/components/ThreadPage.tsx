/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Subforum, Thread, Post, User, Category, UserGroup } from '../types';
import { 
  ArrowLeft, 
  Pin, 
  Lock, 
  Unlock, 
  Trash2, 
  MessageSquare, 
  Edit3, 
  Heart, 
  Quote as QuoteIcon, 
  ShieldCheck, 
  CheckCircle,
  Clock,
  Send
} from 'lucide-react';
import { formatForumDate, renderReputationDots, parseBBCode } from '../utils';

interface ThreadPageProps {
  thread: Thread;
  subforum: Subforum;
  category: Category | undefined;
  posts: Post[];
  users: User[];
  userGroups: UserGroup[];
  currentUser: User;
  onGoBack: () => void;
  onAddReply: (content: string) => void;
  onLikePost: (postId: string) => void;
  onToggleSticky: (threadId: string) => void;
  onToggleLocked: (threadId: string) => void;
  onDeleteThread: (threadId: string) => void;
  onDeletePost: (postId: string) => void;
  onEditPost: (postId: string, newContent: string) => void;
}

export default function ThreadPage({
  thread,
  subforum,
  category,
  posts,
  users,
  userGroups,
  currentUser,
  onGoBack,
  onAddReply,
  onLikePost,
  onToggleSticky,
  onToggleLocked,
  onDeleteThread,
  onDeletePost,
  onEditPost
}: ThreadPageProps) {

  const [replyContent, setReplyContent] = useState('');
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Find posts belonging to this thread, sorted by creation date
  const threadPosts = posts
    .filter(p => p.threadId === thread.id)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const canModerate = currentUser.role === 'admin' || currentUser.role === 'mod';

  const handlePostReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    if (thread.isLocked && !canModerate) {
      setErrorMsg('La discussione è chiusa. Non puoi rispondere.');
      return;
    }

    onAddReply(replyContent.trim());
    setReplyContent('');
    setErrorMsg('');
  };

  const handleEditClick = (post: Post) => {
    setEditingPostId(post.id);
    setEditContent(post.content);
  };

  const handleSaveEdit = (postId: string) => {
    if (!editContent.trim()) return;
    onEditPost(postId, editContent.trim());
    setEditingPostId(null);
    setEditContent('');
  };

  // Safe wrapper for quotes that inserts vBulletin syntax directly into response
  const handleQuoteClick = (post: Post, authorName: string) => {
    const formattedQuote = `[quote=${authorName}]${post.content}[/quote]\n`;
    setReplyContent(prev => prev + formattedQuote);
    // Scroll smoothly to quick reply Editor
    document.getElementById('quick-reply-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Quick BBCode tags helper for Quick Reply
  const insertBBCodeToReply = (tag: string) => {
    const textarea = document.getElementById('quick-reply-textarea') as HTMLTextAreaElement;
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
    else if (tag === 'code') replacement = `[code]${selectedText || '// codice'}[/code]`;

    setReplyContent(before + replacement + after);
    textarea.focus();
  };

  return (
    <div className="space-y-4" id="thread-page-view">
      
      {/* Breadcrumbs Navigation */}
      <div className="bg-[#f2f2f2] border border-gray-300 px-4 py-2.5 rounded-sm text-[11px] flex justify-between items-center gap-2 select-none shadow-sm">
        <div className="flex flex-wrap items-center gap-1.5 text-[#666]">
          <span className="hover:underline hover:text-black cursor-pointer" onClick={onGoBack}>
            Forum
          </span>
          <span>&raquo;</span>
          <span className="hover:underline hover:text-black cursor-pointer" onClick={onGoBack}>
            {category?.name || 'Area'}
          </span>
          <span>&raquo;</span>
          <span className="hover:underline hover:text-black cursor-pointer" onClick={onGoBack}>
            {subforum.name}
          </span>
          <span>&raquo;</span>
          <span className="font-bold text-[#1c3c5a] truncate max-w-[200px] md:max-w-xs">{thread.title}</span>
        </div>
        
        <button 
          onClick={onGoBack} 
          className="text-[11px] bg-white hover:bg-slate-50 text-[#3e70a7] font-bold flex items-center gap-1 py-1 px-2.5 rounded-sm border border-gray-300 shadow-sm transition-all cursor-pointer"
          id="btn-thread-back"
        >
          <ArrowLeft size={11} className="text-[#3e70a7]" /> {subforum.name}
        </button>
      </div>

      {/* ADMIN & MOD INTEGRATED CMS CONTROLS CARD */}
      {canModerate && (
        <div className="bg-[#fffdf4] border-2 border-[#ff9900]/40 p-3 text-xs flex flex-wrap justify-between items-center gap-3 shadow-md" id="moderator-cms-panel">
          <div className="flex items-center gap-2 text-[#333]">
            <span className="bg-[#ff9900]/10 text-amber-900 font-bold px-1.5 py-0.5 rounded-sm text-[10px] border border-[#ff9900]/30 uppercase font-mono">
              🛡️ Staff CMS Controls
            </span>
            <span className="font-bold text-[11px]">
              Modera per: <span className="text-amber-800">{currentUser.username}</span>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            {/* Toggle Pin state */}
            <button
              id="cms-btn-toggle-sticky"
              onClick={() => onToggleSticky(thread.id)}
              className="bg-white hover:bg-amber-50 border border-amber-300 font-bold py-1 px-2.5 rounded-sm text-amber-900 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Pin size={11} className="transform rotate-45 text-[#ff9900]" />
              {thread.isSticky ? 'Rimuovi Sticky' : 'Fissa in alto (Sticky)'}
            </button>

            {/* Toggle Lock state */}
            <button
              id="cms-btn-toggle-locked"
              onClick={() => onToggleLocked(thread.id)}
              className="bg-white hover:bg-red-50 border border-red-200 font-bold py-1 px-2.5 rounded-sm text-red-800 flex items-center gap-1 cursor-pointer transition-colors"
            >
              {thread.isLocked ? <Unlock size={11} className="text-red-600" /> : <Lock size={11} className="text-red-600" />}
              {thread.isLocked ? 'Riapri' : 'Chiudi (Block)'}
            </button>

            {/* Delete entire thread */}
            <button
              id="cms-btn-delete-thread"
              onClick={() => {
                if (window.confirm('Sei veramente sicuro di voler cancellare questa discussione e tutti i messaggi associati? L\'azione è irreversibile.')) {
                  onDeleteThread(thread.id);
                }
              }}
              className="bg-red-700 hover:bg-red-800 text-white font-bold py-1 px-2.5 rounded-sm border border-red-900 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Trash2 size={11} />
              Elimina
            </button>
          </div>
        </div>
      )}

      {/* Main Thread Title Banner */}
      <div className="bg-gradient-to-b from-[#2b5a83] to-[#1c3c5a] text-white p-4 border-b-2 border-[#ff9900] shadow-sm flex justify-between items-center gap-4">
        <div>
          <h1 className="font-sans font-bold text-base md:text-lg tracking-tight text-white flex flex-wrap items-center gap-2">
            {thread.isSticky && <span className="text-[10px] uppercase font-sans font-extrabold bg-amber-400 text-slate-900 px-1.5 py-0.5 rounded-sm tracking-wide shadow-sm">Sticky</span>}
            {thread.isLocked && <span className="text-[10px] uppercase font-sans font-extrabold bg-red-600 text-white px-1.5 py-0.5 rounded-sm tracking-wide shadow-sm">Chiusa</span>}
            <span>{thread.title}</span>
          </h1>
          <p className="text-blue-100 text-[10px] mt-0.5">
            Discussione visitata <strong>{thread.viewsCount}</strong> volte.
          </p>
        </div>
      </div>

      {/* POSTS LIST (Classic horizontal split layout vBulletin format) */}
      <div className="space-y-4" id="posts-feed-container">
        {threadPosts.map((post, index) => {
          const author = users.find(u => u.id === post.userId);
          const authorGroup = userGroups.find(g => g.id === author?.role) || { name: author?.role || 'member', colorClass: 'text-blue-700 bg-slate-100 border-slate-300' };
          const authorRep = author ? renderReputationDots(author.likesCount) : null;
          const isPostAuthor = author?.id === currentUser.id;
          const postNumber = index + 1;

          return (
            <div 
              key={post.id} 
              className="border border-[#a5cae4] bg-white shadow-sm overflow-hidden flex flex-col md:flex-row hover:border-[#3e70a7] transition-colors"
              id={`post-node-${post.id}`}
            >
              
              {/* Left Column: Traditional Mini-UserProfile Box */}
              <div className="w-full md:w-56 bg-gray-50 border-b md:border-b-0 md:border-r border-[#a5cae4] p-4 text-center md:text-left flex flex-row md:flex-col items-center md:items-start gap-4 md:gap-2.5 select-none shrink-0" id={`member-box-${post.id}`}>
                
                {/* Avatar with Status Bulb */}
                <div className="relative">
                  <img
                    src={author?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                    alt={author?.username}
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 md:w-20 md:h-20 rounded-sm border border-gray-300 bg-white object-cover shadow-sm mx-auto"
                  />
                  {/* Status indicator */}
                  <span 
                    className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white shadow ${
                      author?.isOnline ? 'bg-green-500' : 'bg-slate-300'
                    }`}
                    title={author?.isOnline ? 'Utente Online adesso' : 'Utente Offline'}
                  />
                </div>

                {/* Username and title badges */}
                <div className="space-y-1 text-left md:w-full">
                  <div className={`font-sans font-extrabold text-sm ${authorGroup.colorClass.split(" ")[0]}`} id={`username-anchor-${post.id}`}>
                    {author?.username || 'Ospite_Sconosciuto'}
                  </div>
                  
                  <div className="text-[10px] font-bold text-gray-600 tracking-tight bg-gray-200 uppercase text-center py-0.5 px-2 rounded-sm border border-gray-300 max-w-[120px] truncate block md:w-full">
                    {author?.title || authorGroup.name}
                  </div>

                  {/* Star indicators based on role */}
                  <div className="flex gap-0.5 mt-1">
                    {Array.from({ length: 2 }).map((_, i) => (
                      <span key={i} className={`text-xs text-yellow-500`}>★</span>
                    ))}
                  </div>
                </div>

                {/* Classic Forum Stats block */}
                <div className="hidden md:block text-[10px] text-gray-500 space-y-1 pt-2 w-full border-t border-gray-200 font-sans">
                  <div className="flex justify-between">
                    <span>Registrato:</span>
                    <strong className="text-gray-700">{author?.registeredAt || 'Generica'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Da:</span>
                    <strong className="text-gray-700 truncate max-w-[110px]" title={author?.location}>{author?.location || 'Italia'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Messaggi:</span>
                    <strong className="text-gray-700">{author?.postCount || '0'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Ringraziato:</span>
                    <strong className="text-gray-700 font-mono">{author?.likesCount || '0'}</strong>
                  </div>

                  {/* Reputation Dots bar */}
                  {authorRep && (
                    <div className="pt-1.5 space-y-1" title={`Reputazione: ${authorRep.label}`}>
                      <div className="text-[8px] uppercase font-bold text-slate-400">Reputazione:</div>
                      <div className="flex gap-1">
                        {Array.from({ length: authorRep.count }).map((_, i) => (
                          <div key={i} className={`w-2.5 h-2.5 rounded-full border ${authorRep.color}`} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

              </div>

              {/* Right Column: Post Body Content */}
              <div className="flex-1 flex flex-col min-w-0" id={`post-content-container-${post.id}`}>
                
                {/* Post Subheader with timestamp & numbering */}
                <div className="bg-[#f6f6f6] border-b border-gray-200 px-4 py-2 flex justify-between items-center text-[10px] font-bold text-[#333]">
                  <div className="flex items-center gap-1">
                    <span>📅 Pubblicato il: {formatForumDate(post.createdAt)}</span>
                  </div>
                  <span className="bg-gray-200 px-1.5 py-0.5 text-[10px] font-mono rounded-sm text-gray-700">
                    #{postNumber}
                  </span>
                </div>

                {/* Live editing panel or normal parsed post body */}
                <div className="p-4 flex-1 flex flex-col text-slate-800 text-xs text-left leading-relaxed font-sans">
                  {editingPostId === post.id ? (
                    <div className="space-y-2 flex-1 flex flex-col">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        rows={6}
                        className="w-full text-xs p-2.5 bg-white border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#ff9900] font-mono"
                        id={`text-edit-body-${post.id}`}
                      />
                      <div className="flex justify-end gap-2 text-[11px]">
                        <button
                          onClick={() => setEditingPostId(null)}
                          className="bg-slate-100 hover:bg-slate-200 border border-slate-300 py-1 px-3 rounded-sm text-slate-700 font-bold cursor-pointer"
                        >
                          Annulla
                        </button>
                        <button
                          id={`save-edit-btn-${post.id}`}
                          onClick={() => handleSaveEdit(post.id)}
                          className="bg-[#3e70a7] hover:bg-blue-600 text-white py-1 px-3.5 border border-blue-800 rounded-sm font-bold shadow-sm cursor-pointer"
                        >
                          Salva Modifiche
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 space-y-3 prose max-w-none">
                      {/* Convert BBCode markup safely to HTML JSX */}
                      <div className="break-words" id={`post-body-text-${post.id}`}>
                        {parseBBCode(post.content)}
                      </div>

                      {/* SIGNA CLASSIC BLOCK (separated by horizontal dash lines) */}
                      {author?.signature && (
                        <div className="pt-4 mt-6 border-t border-gray-200 opacity-80 select-none text-[10px] text-gray-500 font-sans">
                          {parseBBCode(author.signature)}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer / Row Controls Panel */}
                <div className="bg-gray-50 border-t border-gray-100 px-4 py-2 text-xs flex justify-between items-center flex-wrap gap-2">
                  
                  {/* Likes/Hearts status & actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onLikePost(post.id)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-full border transition-colors cursor-pointer ${
                        post.likes.includes(currentUser.id)
                          ? 'bg-red-50 border-red-300 text-red-600 font-bold'
                          : 'bg-white hover:bg-red-50 border-gray-300 text-gray-500 hover:text-red-500'
                      }`}
                      id={`like-post-btn-${post.id}`}
                      title={post.likes.includes(currentUser.id) ? 'Rimuovi ringraziamento' : 'Ringrazia autore (Like)'}
                    >
                      <Heart size={11} className={post.likes.includes(currentUser.id) ? 'fill-current' : ''} />
                      <span className="text-[10px]">
                        {post.likes.length > 0 ? `Ringraziamenti (${post.likes.length})` : 'Ringrazia Autore'}
                      </span>
                    </button>

                    {/* Show who liked under the post */}
                    {post.likes.length > 0 && (
                      <span className="text-[9px] text-gray-400 italic">
                        Post apprezzato da: {post.likes.map(id => users.find(u => u.id === id)?.username).filter(Boolean).join(', ')}
                      </span>
                    )}
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center gap-2">
                    {/* Quotes copies body content instantly wrapping quote tags */}
                    <button
                      onClick={() => handleQuoteClick(post, author?.username || 'Autore')}
                      className="bg-white hover:bg-[#eff4f8] border border-gray-300 text-gray-600 hover:text-[#3e70a7] py-1 px-2.5 rounded-sm flex items-center gap-1 font-bold shadow-sm transition-colors cursor-pointer"
                      id={`quote-post-btn-${post.id}`}
                    >
                      <QuoteIcon size={11} /> Citazione
                    </button>

                    {/* Custom editor toggle if author or Admin/Mod rules */}
                    {(isPostAuthor || canModerate) && editingPostId !== post.id && (
                      <button
                        onClick={() => handlePostReply && handleEditClick(post)}
                        className="bg-white hover:bg-amber-50 border border-gray-300 text-amber-800 py-1 px-2.5 rounded-sm flex items-center gap-1 font-bold shadow-sm transition-colors cursor-pointer"
                        id={`edit-post-btn-${post.id}`}
                      >
                        <Edit3 size={11} /> Modifica
                      </button>
                    )}

                    {/* Deletion of individual replies (Mod/Admin has full permissions, author has only if not OP or all) */}
                    {(canModerate || (isPostAuthor && postNumber > 1)) && (
                      <button
                        onClick={() => {
                          if (window.confirm('Vuoi eliminare definitivamente questo messaggio?')) {
                            onDeletePost(post.id);
                          }
                        }}
                        className="bg-white hover:bg-red-50 border border-red-200 text-red-700 py-1 px-2.5 rounded-sm flex items-center gap-0.5 shadow-sm transition-colors cursor-pointer"
                        id={`delete-post-btn-${post.id}`}
                      >
                        <Trash2 size={11} />
                      </button>
                    )}
                  </div>

                </div>

              </div>

            </div>
          );
        })}
      </div>

      {/* QUICK REPLY EDITOR (Nostalgic quick-access response panel) */}
      <div className="border border-[#a5cae4] rounded-sm bg-white shadow-sm overflow-hidden" id="quick-reply-section">
        <div className="bg-[#3e70a7] text-white px-3 py-2 flex items-center gap-1 text-xs font-bold font-sans border-b border-[#a5cae4]">
          <span>⚡ Risposta Rapida alla Discussione</span>
        </div>

        <div className="p-4 space-y-3">
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-2.5 rounded-sm">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Locked warning, but lets Admin/Mod ignore lock rule */}
          {thread.isLocked ? (
            <div className={`text-xs p-3 rounded-sm flex items-center gap-2 ${canModerate ? 'bg-amber-150 border border-amber-300 text-amber-800' : 'bg-red-50 border border-red-200 text-red-700'}`}>
              <Lock size={14} className="stroke-[2.5]" />
              {canModerate ? (
                <span>Questa discussione è <strong>CHIUSA</strong> per gli utenti standard, ma in quanto Staff/Admin hai il permesso di rispondere comunque.</span>
              ) : (
                <span>Questa discussione è <strong>CHIUSA</strong> da un moderatore. Non è consentito inserire ulteriori risposte.</span>
              )}
            </div>
          ) : null}

          {/* Form display */}
          {(!thread.isLocked || canModerate) && (
            <form onSubmit={handlePostReply} className="space-y-3 font-sans">
              
              {/* editor shortcuts */}
              <div className="flex flex-wrap items-center gap-1 bg-white p-1 rounded-sm border border-gray-300 text-[10px]">
                <button
                  type="button"
                  onClick={() => insertBBCodeToReply('b')}
                  className="bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded-sm font-black border border-slate-300 select-none text-slate-800"
                  title="Grassetto"
                >
                  B
                </button>
                <button
                  type="button"
                  onClick={() => insertBBCodeToReply('i')}
                  className="bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded-sm italic border border-slate-300 select-none text-slate-800"
                  title="Corsivo"
                >
                  I
                </button>
                <button
                  type="button"
                  onClick={() => insertBBCodeToReply('u')}
                  className="bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded-sm underline border border-slate-300 select-none text-slate-800"
                  title="Sottolineato"
                >
                  U
                </button>
                <button
                  type="button"
                  onClick={() => insertBBCodeToReply('code')}
                  className="bg-slate-100 hover:bg-slate-200 px-1.5 py-0.5 rounded-sm font-mono border border-slate-300 text-[#3e70a7] select-none text-[9px]"
                  title="Codice"
                >
                  [Code]
                </button>
                <span className="text-[10px] text-gray-400 italic ml-2 hidden sm:inline-block">
                  Suggerimento: Puoi citare un post cliccando sul bottone "Citazione" soprastante.
                </span>
                <span className="text-[10px] text-gray-500 ml-auto font-bold px-2 py-0.5 select-none bg-blue-50 border border-blue-150 rounded-sm">
                  Firma attiva autom.
                </span>
              </div>

              {/* Textarea */}
              <textarea
                id="quick-reply-textarea"
                rows={5}
                placeholder="Scrivi qui la tua risposta rapida..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="w-full text-xs p-2.5 bg-white border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#ff9900] text-slate-700 font-mono focus:shadow-inner"
              />

              <div className="flex justify-end gap-2 text-xs">
                <button
                  type="submit"
                  disabled={!replyContent.trim()}
                  className={`px-4 py-2 rounded-sm font-bold transition-all flex items-center gap-1.5 shadow border ${
                    replyContent.trim()
                      ? 'bg-[#3e70a7] hover:bg-blue-600 border-blue-800 text-white cursor-pointer'
                      : 'bg-slate-300 border-slate-400 text-slate-500 cursor-not-allowed text-xs'
                  }`}
                  id="btn-send-quick-reply"
                >
                  <Send size={11} /> Rispondi
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
