/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, UserGroup } from '../types';
import { formatForumDate } from '../utils';
import { Calendar, MapPin, Heart, MessageSquare } from 'lucide-react';

interface MembersPageProps {
  users: User[];
  userGroups: UserGroup[];
}

export default function MembersPage({ users, userGroups }: MembersPageProps) {
  
  // Sort users 
  const sortedMembers = [...users].sort((a, b) => {
    const roleA = userGroups.find(g => g.id === a.role);
    const roleB = userGroups.find(g => g.id === b.role);
    // Simple sort: Admin > Mod > everything else
    const rankA = roleA?.isAdmin ? 1 : roleA?.isMod ? 2 : 3;
    const rankB = roleB?.isAdmin ? 1 : roleB?.isMod ? 2 : 3;
    return rankA - rankB;
  });

  return (
    <div className="space-y-4" id="members-page-wrapper">
      
      {/* Title block */}
      <div className="bg-gradient-to-b from-[#2b5a83] to-[#1c3c5a] text-white p-4 border-b-2 border-[#ff9900] shadow-sm">
        <h2 className="font-sans font-bold text-lg tracking-tight text-white">👥 Lista dei Membri Iscritti (Member List)</h2>
        <p className="text-blue-100 text-xs mt-1">
          Visualizza l'elenco completo della community ordinato per grado. Puoi metterti in contatto con loro scrivendo nelle discussioni.
        </p>
      </div>

      {/* Grid of cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="members-list-grid">
        {sortedMembers.map(u => {
          const uGroup = userGroups.find(g => g.id === u.role) || { name: u.role, colorClass: 'text-gray-500 bg-gray-50' };
          return (
            <div 
              key={u.id} 
              className="bg-white border border-gray-300 rounded-sm shadow-sm overflow-hidden flex flex-col hover:border-[#3e70a7] transition-colors"
              id={`member-card-${u.id}`}
            >
              {/* Header colored banner */}
              <div className="h-2 bg-gradient-to-r from-[#2b5a83]/40 to-[#ff9900]/40" />
              
              <div className="p-4 flex-1 flex gap-3.5 text-xs text-left">
                {/* Avatar with live online state */}
                <div className="shrink-0 relative self-start select-none">
                  <img
                    src={u.avatarUrl}
                    alt={u.username}
                    referrerPolicy="no-referrer"
                    className="w-14 h-14 object-cover rounded-sm bg-white border border-gray-300 shadow-sm"
                  />
                  <span 
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white shadow ${
                      u.isOnline ? 'bg-green-500' : 'bg-slate-300'
                    }`}
                    title={u.isOnline ? 'Online' : 'Offline'}
                  />
                </div>

                {/* Details layout */}
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`font-extrabold text-sm hover:underline cursor-pointer truncate ${uGroup.colorClass.split(' ')[0]}`}>
                      {u.username}
                    </span>
                    <span className={`text-[9px] uppercase font-bold py-0.5 px-1.5 rounded-sm border select-none ${u.isOnline ? 'bg-green-50 border-green-200 text-green-700' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                      {u.isOnline ? 'Online' : 'Offline'}
                    </span>
                  </div>

                  <p className="text-[10px] bg-gray-100 border border-gray-200 hover:bg-gray-200 text-gray-600 px-2 py-0.5 rounded-sm font-bold inline-block truncate max-w-full">
                    {u.title || uGroup.name}
                  </p>

                  <div className="text-[10px] text-gray-400 font-sans space-y-1 pt-1.5 border-t border-gray-200">
                    <div className="flex items-center gap-1">
                      <Calendar size={11} className="text-gray-400 shrink-0" />
                      <span>Registrato il: <strong>{u.registeredAt}</strong></span>
                    </div>
                    {u.location && (
                      <div className="flex items-center gap-1 truncate" title={u.location}>
                        <MapPin size={11} className="text-gray-400 shrink-0" />
                        <span>Da: <strong className="text-gray-600 truncate">{u.location}</strong></span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats Footer of the card */}
              <div className="bg-gray-50/70 border-t border-gray-150 px-4 py-2 flex justify-between text-[11px] text-gray-500 font-sans">
                <div className="flex items-center gap-1 font-bold text-gray-600">
                  <MessageSquare size={11} className="text-gray-400" />
                  <span>Messaggi: <strong className="text-gray-700 font-mono">{u.postCount}</strong></span>
                </div>
                <div className="flex items-center gap-1 font-bold text-gray-600">
                  <Heart size={11} className="text-red-500" />
                  <span>Ringraziato: <strong className="text-gray-700 font-mono">{u.likesCount}</strong></span>
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
