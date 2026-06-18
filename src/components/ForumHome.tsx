/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Category, Subforum, Thread, Post, User, UserGroup } from '../types';
import { MessageSquare, Calendar, User as UserIcon, LogIn, ChevronDown, ChevronUp, FileText, CheckCircle } from 'lucide-react';
import { formatForumDate } from '../utils';

interface ForumHomeProps {
  categories: Category[];
  subforums: Subforum[];
  threads: Thread[];
  posts: Post[];
  users: User[];
  userGroups: UserGroup[];
  currentUser: User;
  onSelectSubforum: (subforumId: string) => void;
  onSelectThread: (threadId: string) => void;
}

export default function ForumHome({
  categories,
  subforums,
  threads,
  posts,
  users,
  userGroups,
  currentUser,
  onSelectSubforum,
  onSelectThread
}: ForumHomeProps) {
  // Collapsed categories state
  const [collapsedCats, setCollapsedCats] = useState<Record<string, boolean>>({});

  const toggleCategory = (catId: string) => {
    setCollapsedCats(prev => ({
      ...prev,
      [catId]: !prev[catId]
    }));
  };

  // General Forum stats
  const totalThreads = threads.length;
  const totalPosts = posts.length;
  const totalUsersCount = users.length;
  
  // Sort users by registration to find newest
  const sortedUsersByReg = [...users].sort((a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime());
  const newestMember = sortedUsersByReg[0];

  // Whos online (including Guest simulated count + list isOnline)
  const onlineUsers = users.filter(u => u.isOnline);

  return (
    <div className="space-y-6" id="forum-home-wrapper">
      
      {/* Welcome banner / Announcements widget */}
      <div className="bg-[#FFFFE1] border border-[#ff9900]/40 text-[#4a3b05] p-4 rounded-sm text-xs shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <p className="font-bold flex items-center gap-1.5 text-[#1c3c5a] text-sm">
            <span>📢</span> Benvenuto sul vBulletin-Style Forum CMS!
          </p>
          <p className="text-[#555]">
            Questo forum simula perfettamente le spettacolari funzionalità e i layout storici delle community PHP anni 2000. Puoi usare il 
            <strong> selettore utenti in alto</strong> per assumere ruoli di Mod o Admin e gestire liberamente la moderazione!
          </p>
        </div>
        <div className="flex gap-2">
          <span className="bg-[#ff9900] text-white font-bold px-2.5 py-1 rounded text-[10px] uppercase shadow-sm whitespace-nowrap">
            Database Locale Attivo
          </span>
        </div>
      </div>

      {/* Main Forum Categories & Subforums */}
      <div className="space-y-5">
        {categories
          .sort((a, b) => a.order - b.order)
          .map(category => {
            const isCollapsed = collapsedCats[category.id];
            const matchingSubforums = subforums.filter(sub => sub.categoryId === category.id);

            return (
              <div key={category.id} className="border border-[#a5cae4] bg-white shadow-sm" id={`category-block-${category.id}`}>
                {/* Category Header (Classic Steel Blue and Gold Theme) */}
                <div 
                  onClick={() => toggleCategory(category.id)}
                  className="bg-[#3e70a7] text-white px-3 py-2 flex justify-between items-center cursor-pointer select-none border-b border-[#a5cae4]"
                >
                  <h3 className="font-sans font-bold text-sm text-white flex items-center gap-2">
                    {category.name}
                  </h3>
                  <button className="text-white hover:text-gray-200 transition-colors" id={`btn-toggle-cat-${category.id}`}>
                    {isCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                  </button>
                </div>

                {/* Subforums Display */}
                {!isCollapsed && (
                  <div className="bg-white overflow-x-auto">
                    {/* Desktop Column Titles */}
                    <table className="w-full text-left border-collapse min-w-[700px] md:min-w-0">
                      <thead>
                        <tr className="bg-[#f2f2f2] text-[#666] text-[10px] font-bold uppercase border-b border-gray-300">
                          <th className="py-2 px-4 w-12 text-center">Stato</th>
                          <th className="py-2 px-3">Forum / Descrizione</th>
                          <th className="py-2 px-3 w-28 text-center border-l border-r border-gray-200">Discussioni</th>
                          <th className="py-2 px-3 w-24 text-center border-r border-gray-200">Messaggi</th>
                          <th className="py-2 px-4 w-64">Ultimo Messaggio</th>
                        </tr>
                      </thead>
                      <tbody>
                        {matchingSubforums.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-6 text-center text-slate-400 text-xs italic">
                              Nessuna sotto-sezione inserita in questa categoria.
                            </td>
                          </tr>
                        ) : (
                          matchingSubforums.map(sub => {
                            // Find matching threads and posts to make live updates instantly editable
                            const subThreads = threads.filter(t => t.subforumId === sub.id) || [];
                            const tIds = subThreads.map(t => t.id);
                            const subPosts = posts.filter(p => tIds.includes(p.threadId)) || [];
                            
                            // Find the actual last post
                            let lastPostDetails = sub.lastPost;
                            if (subThreads.length > 0) {
                              const sortedSubThreads = [...subThreads].sort((a, b) => new Date(b.lastPostAt).getTime() - new Date(a.lastPostAt).getTime());
                              const latestThread = sortedSubThreads[0];
                              const rPosts = posts.filter(p => p.threadId === latestThread.id);
                              const sortedPosts = [...rPosts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                              const latestPost = sortedPosts[0];

                              if (latestPost) {
                                const author = users.find(u => u.id === latestPost.userId);
                                lastPostDetails = {
                                  threadId: latestThread.id,
                                  threadTitle: latestThread.title,
                                  userId: latestPost.userId,
                                  username: author ? author.username : latestThread.lastPostUsername,
                                  createdAt: latestPost.createdAt
                                };
                              }
                            } else {
                              lastPostDetails = null;
                            }

                            return (
                              <tr 
                                key={sub.id} 
                                className="border-b border-gray-100 hover:bg-[#eff4f8] cursor-pointer transition-colors"
                                onClick={() => onSelectSubforum(sub.id)}
                                id={`subforum-row-${sub.id}`}
                              >
                                {/* Unread Icon (Folder icon styled like original mockup green/blue container) */}
                                <td className="py-3 px-2 text-center">
                                  <div className="w-6 h-6 bg-blue-100 border border-blue-300 rounded-sm inline-flex items-center justify-center mx-auto shadow-sm">
                                    <MessageSquare size={11} className="text-[#3e70a7]" />
                                  </div>
                                </td>

                                {/* Subforum Title and Info */}
                                <td className="py-3 px-3">
                                  <span className="font-sans font-bold text-sm text-[#2b5a83] hover:underline">
                                    {sub.name}
                                  </span>
                                  <p className="text-gray-500 text-[11px] mt-0.5 max-w-2xl leading-relaxed">
                                    {sub.description}
                                  </p>
                                </td>

                                {/* Thread Counts */}
                                <td className="py-3 px-3 text-center text-xs font-semibold text-[#555] font-mono border-l border-r border-gray-100">
                                  {subThreads.length}
                                </td>

                                {/* Post Counts */}
                                <td className="py-3 px-3 text-center text-xs font-semibold text-[#555] font-mono border-r border-gray-100">
                                  {subPosts.length}
                                </td>

                                {/* Last Post author and timestamp */}
                                <td className="py-3 px-4 text-[10px] font-sans text-gray-500">
                                  {lastPostDetails ? (
                                    <div className="space-y-0.5 text-left max-w-[240px]" onClick={(e) => e.stopPropagation()}>
                                      <span 
                                        onClick={() => onSelectThread(lastPostDetails!.threadId)}
                                        className="font-bold text-[11px] text-[#2b5a83] hover:underline truncate block cursor-pointer"
                                        title={lastPostDetails.threadTitle}
                                      >
                                        📄 {lastPostDetails.threadTitle}
                                      </span>
                                      <div className="text-[10px] flex items-center gap-1 text-gray-400">
                                        <span>Last Post:</span>
                                        <span className="text-[#2b5a83] font-bold" id={`lastpost-author-${sub.id}`}>{lastPostDetails.username}</span>
                                      </div>
                                      <div className="text-[9px] text-gray-400 whitespace-nowrap">
                                        {formatForumDate(lastPostDetails.createdAt)}
                                      </div>
                                    </div>
                                  ) : (
                                    <span className="text-gray-400 italic text-[10px]">Nessun messaggio</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
      </div>

      {/* Forum Stats & Who is Online (vBulletin Signature Layout) */}
      <div className="border border-[#a5cae4] bg-white shadow-sm" id="forum-statistics-panel">
        <div className="bg-[#3e70a7] text-white px-3 py-2 font-sans font-bold text-sm border-b border-[#a5cae4]">
          What's Going On?
        </div>
        
        <div className="p-4 space-y-4 divide-y divide-gray-100 text-xs text-[#333]">
          
          {/* Who is Online Section */}
          <div className="space-y-2">
            <h4 className="font-bold text-[#2b5a83] flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
              🟢 Currently Online:
            </h4>
            <p className="text-gray-500 leading-relaxed text-[11px]">
              Al momento ci sono <strong className="text-gray-700">{onlineUsers.length + 33}</strong> utenti attivi sul forum (di cui <strong>{onlineUsers.length}</strong> membri registrati e <strong>33</strong> visitatori anonimi negli ultimi 15 minuti).
            </p>
            
            {/* Usernames list styled based on roles */}
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 mt-1 text-[11px]">
              {users.map((u, idx) => {
                const uG = userGroups.find(g => g.id === u.role) || { name: u.role, colorClass: "text-gray-600 font-medium" };
                return (
                  <span key={u.id} className="inline-flex items-center">
                    <span 
                      className={`${uG.colorClass.split(" ")[0]} hover:underline cursor-pointer font-bold`}
                      title={`${u.username} (${uG.name})`}
                      id={`online-user-${u.id}`}
                    >
                      {u.username}
                    </span>
                    {idx < users.length - 1 && <span className="text-gray-400 ml-1">,</span>}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Statistics counter box */}
          <div className="pt-3 space-y-2">
            <h4 className="font-bold text-[#2b5a83] text-[11px] uppercase tracking-wider">
              📂 Forum Statistics:
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-3 rounded-sm border border-gray-200 text-center font-mono text-[#333]">
              <div className="p-1">
                <p className="text-[#1c3c5a] text-lg font-bold">{totalThreads}</p>
                <p className="text-gray-500 text-[10px] font-sans uppercase font-bold">Threads</p>
              </div>
              <div className="p-1">
                <p className="text-[#1c3c5a] text-lg font-bold">{totalPosts}</p>
                <p className="text-gray-500 text-[10px] font-sans uppercase font-bold">Posts</p>
              </div>
              <div className="p-1">
                <p className="text-[#1c3c5a] text-lg font-bold">{totalUsersCount}</p>
                <p className="text-gray-500 text-[10px] font-sans uppercase font-bold">Members</p>
              </div>
              <div className="p-1">
                <p className="text-[#ff9900] text-sm font-bold truncate" id="stat-newest-user">{newestMember ? newestMember.username : 'Nessuno'}</p>
                <p className="text-gray-500 text-[10px] font-sans uppercase font-bold">Newest Member</p>
              </div>
            </div>
          </div>

          {/* User Legend */}
          <div className="pt-3 flex flex-wrap gap-4 items-center justify-between text-[11px] text-gray-500">
            <div className="flex items-center gap-3">
              <span className="font-bold">Staff Groups:</span>
              <span className="text-red-700 font-bold">🔴 Administrators</span>
              <span className="text-green-700 font-bold font-medium">🟢 Staff Moderators</span>
              <span className="text-gray-600 font-medium">🔵 Registered Members</span>
            </div>
            <div className="italic text-gray-400 text-[9px] font-mono">
              vB-PHP Engine v4.2.5
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
