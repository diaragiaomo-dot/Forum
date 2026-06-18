/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Category, Subforum, Thread, Post, User, AuditLog, UserGroup } from './types';
import { getStoredData, saveStoredData } from './data';
import Header from './components/Header';
import ForumHome from './components/ForumHome';
import SubforumPage from './components/SubforumPage';
import ThreadPage from './components/ThreadPage';
import AdminCP from './components/AdminCP';
import ProfilePage from './components/ProfilePage';
import SearchPage from './components/SearchPage';
import MembersPage from './components/MembersPage';

export default function App() {
  // Core Database States
  const [categories, setCategories] = useState<Category[]>([]);
  const [subforums, setSubforums] = useState<Subforum[]>([]);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [userGroups, setUserGroups] = useState<UserGroup[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // View States
  const [activeTab, setActiveTab] = useState<string>('forum'); // 'forum' | 'members' | 'profile' | 'admin' | 'search'
  const [selectedSubforumId, setSelectedSubforumId] = useState<string | null>(null);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 1. Load Initial State from Storage / Seeds on Mounting
  useEffect(() => {
    const data = getStoredData();
    setCategories(data.categories);
    setSubforums(data.subforums);
    setThreads(data.threads);
    setPosts(data.posts);
    setUsers(data.users);
    setUserGroups(data.userGroups);
    setAuditLogs(data.auditLogs);
    
    // Set logged user of the simulator
    // Find the current admin in current users list to keep it updated with edits
    const activeUser = data.users.find(u => u.id === data.currentUser?.id) || data.currentUser;
    setCurrentUser(activeUser);
  }, []);

  // 2. Persist database edits to localStorage on changes
  useEffect(() => {
    if (categories.length > 0 && currentUser) {
      saveStoredData(categories, subforums, threads, posts, users, userGroups, auditLogs, currentUser);
    }
  }, [categories, subforums, threads, posts, users, userGroups, auditLogs, currentUser]);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#e1e1e2] flex items-center justify-center font-sans text-xs">
        <div className="bg-white p-6 rounded-sm border border-[#a5cae4] text-center shadow-sm space-y-2">
          <p className="font-bold text-[#333]">Caricamento del database del forum...</p>
          <div className="w-8 h-8 rounded-full border-4 border-t-[#3e70a7] border-gray-200 animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  // --- HANDLERS ---

  // User switcher
  const handleSelectUser = (user: User) => {
    setCurrentUser(user);
    // Add micro simulation log
    const log: AuditLog = {
      id: `log-sim-${Date.now()}`,
      userId: user.id,
      username: user.username,
      action: 'Simulatore Sessione',
      target: `Sessione assunta a ruolo ${user.role.toUpperCase()}`,
      timestamp: new Date().toISOString()
    };
    setAuditLogs(prev => [log, ...prev]);
  };

  // Select subforum to browse threads
  const handleSelectSubforum = (subforumId: string) => {
    setSelectedSubforumId(subforumId);
    setSelectedThreadId(null);
    setActiveTab('forum');
    setSearchQuery('');
  };

  // Select a specific thread to read replies
  const handleSelectThread = (threadId: string) => {
    setSelectedThreadId(threadId);
    // Find thread to dynamically increment views count
    setThreads(prev => 
      prev.map(t => {
        if (t.id === threadId) {
          return { ...t, viewsCount: t.viewsCount + 1 };
        }
        return t;
      })
    );
    setActiveTab('forum');
  };

  const handleGoBack = () => {
    if (selectedThreadId) {
      setSelectedThreadId(null);
    } else if (selectedSubforumId) {
      setSelectedSubforumId(null);
    }
  };

  // -------------------------
  // WRITING NEW CONTENT (CRUD)
  // -------------------------

  // Create thread
  const handleAddNewThread = (title: string, content: string) => {
    if (!selectedSubforumId) return;

    const newThreadId = `thread-${Date.now()}`;
    const newPostId = `post-op-${Date.now()}`;
    const nowISO = new Date().toISOString();

    // 1. Create Thread object
    const newThread: Thread = {
      id: newThreadId,
      subforumId: selectedSubforumId,
      title,
      userId: currentUser.id,
      createdAt: nowISO,
      isSticky: false,
      isLocked: false,
      repliesCount: 0,
      viewsCount: 1,
      lastPostAt: nowISO,
      lastPostUserId: currentUser.id,
      lastPostUsername: currentUser.username
    };

    // 2. Create the opening post (Post #1)
    const openingPost: Post = {
      id: newPostId,
      threadId: newThreadId,
      userId: currentUser.id,
      content,
      createdAt: nowISO,
      likes: []
    };

    // 3. Update active states
    setThreads(prev => [newThread, ...prev]);
    setPosts(prev => [...prev, openingPost]);
    
    // Increment current user's post count
    setUsers(prev => 
      prev.map(u => {
        if (u.id === currentUser.id) {
          const updated = { ...u, postCount: u.postCount + 1 };
          setCurrentUser(updated);
          return updated;
        }
        return u;
      })
    );

    // Dynamic counters in Subforum list
    setSubforums(prev => 
      prev.map(sub => {
        if (sub.id === selectedSubforumId) {
          return {
            ...sub,
            threadsCount: sub.threadsCount + 1,
            postsCount: sub.postsCount + 1,
            lastPost: {
              threadId: newThreadId,
              threadTitle: title,
              userId: currentUser.id,
              username: currentUser.username,
              createdAt: nowISO
            }
          };
        }
        return sub;
      })
    );

    // Auto-view the newly created thread instantly!
    setSelectedThreadId(newThreadId);
  };

  // Add thread replies (Post #2, #3, etc.)
  const handleAddReply = (content: string) => {
    if (!selectedThreadId) return;

    const thread = threads.find(t => t.id === selectedThreadId);
    if (!thread) return;

    const newPostId = `post-${Date.now()}`;
    const nowISO = new Date().toISOString();

    const newReply: Post = {
      id: newPostId,
      threadId: selectedThreadId,
      userId: currentUser.id,
      content,
      createdAt: nowISO,
      likes: []
    };

    // Append post
    setPosts(prev => [...prev, newReply]);

    // Update parent thread stats
    setThreads(prev => 
      prev.map(t => {
        if (t.id === selectedThreadId) {
          return {
            ...t,
            repliesCount: t.repliesCount + 1,
            lastPostAt: nowISO,
            lastPostUserId: currentUser.id,
            lastPostUsername: currentUser.username
          };
        }
        return t;
      })
    );

    // Increment current user's post count
    setUsers(prev => 
      prev.map(u => {
        if (u.id === currentUser.id) {
          const updated = { ...u, postCount: u.postCount + 1 };
          setCurrentUser(updated);
          return updated;
        }
        return u;
      })
    );

    // Update dynamic subforum counts
    setSubforums(prev => 
      prev.map(sub => {
        if (sub.id === thread.subforumId) {
          return {
            ...sub,
            postsCount: sub.postsCount + 1,
            lastPost: {
              threadId: thread.id,
              threadTitle: thread.title,
              userId: currentUser.id,
              username: currentUser.username,
              createdAt: nowISO
            }
          };
        }
        return sub;
      })
    );
  };

  // Like / Heart a post (Reputation helper!)
  const handleLikePost = (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const hasLiked = post.likes.includes(currentUser.id);
    let updatedLikes = [...post.likes];

    if (hasLiked) {
      // Unlike
      updatedLikes = updatedLikes.filter(id => id !== currentUser.id);
    } else {
      // Like
      updatedLikes.push(currentUser.id);
    }

    // Write change
    setPosts(prev => 
      prev.map(p => {
        if (p.id === postId) {
          return { ...p, likes: updatedLikes };
        }
        return p;
      })
    );

    // Calculate dynamic reputation score increase/decrease for target post author
    const postAuthorId = post.userId;
    setUsers(prev => 
      prev.map(u => {
        if (u.id === postAuthorId) {
          const delta = hasLiked ? -1 : 1;
          const updatedUser = { ...u, likesCount: Math.max(0, u.likesCount + delta) };
          
          // If the profile liked was the active logged-in simulator user, keep it in sync!
          if (u.id === currentUser.id) {
            setCurrentUser(updatedUser);
          }
          return updatedUser;
        }
        return u;
      })
    );
  };

  // -------------------------
  // MOD CP MODERATION CMS CODES
  // -------------------------

  // Toggle Sticky state
  const handleToggleSticky = (threadId: string) => {
    setThreads(prev => 
      prev.map(t => {
        if (t.id === threadId) {
          const nextSticky = !t.isSticky;
          // Log CMS activity
          const log: AuditLog = {
            id: `log-${Date.now()}`,
            userId: currentUser.id,
            username: currentUser.username,
            action: nextSticky ? 'Pin Sticky Thread' : 'Unpin Sticky Thread',
            target: `Discussione ID: ${t.title}`,
            timestamp: new Date().toISOString()
          };
          setAuditLogs(prevLogs => [log, ...prevLogs]);

          return { ...t, isSticky: nextSticky };
        }
        return t;
      })
    );
  };

  // Toggle Locked state
  const handleToggleLocked = (threadId: string) => {
    setThreads(prev => 
      prev.map(t => {
        if (t.id === threadId) {
          const nextLocked = !t.isLocked;
          // Log CMS activity
          const log: AuditLog = {
            id: `log-${Date.now()}`,
            userId: currentUser.id,
            username: currentUser.username,
            action: nextLocked ? 'Blocca Discussione' : 'Sblocca Discussione',
            target: `Discussione ID: ${t.title}`,
            timestamp: new Date().toISOString()
          };
          setAuditLogs(prevLogs => [log, ...prevLogs]);

          return { ...t, isLocked: nextLocked };
        }
        return t;
      })
    );
  };

  // Delete thread
  const handleDeleteThread = (threadId: string) => {
    const threadToDelete = threads.find(t => t.id === threadId);
    if (!threadToDelete) return;

    // Remove thread + associated posts
    const associatedPostsCount = posts.filter(p => p.threadId === threadId).length;
    setThreads(prev => prev.filter(t => t.id !== threadId));
    setPosts(prev => prev.filter(p => p.threadId !== threadId));

    // Recalculate subforum counts
    setSubforums(prev => 
      prev.map(sub => {
        if (sub.id === threadToDelete.subforumId) {
          return {
            ...sub,
            threadsCount: Math.max(0, sub.threadsCount - 1),
            postsCount: Math.max(0, sub.postsCount - associatedPostsCount),
          };
        }
        return sub;
      })
    );

    // Audit logs
    const log: AuditLog = {
      id: `log-${Date.now()}`,
      userId: currentUser.id,
      username: currentUser.username,
      action: 'Eliminazione Thread',
      target: `Titolo: "${threadToDelete.title}" (Cancellati ${associatedPostsCount} messaggi)`,
      timestamp: new Date().toISOString()
    };
    setAuditLogs(prev => [log, ...prev]);

    // Return to subforum page view
    setSelectedThreadId(null);
  };

  // Delete individual post
  const handleDeletePost = (postId: string) => {
    const postToDelete = posts.find(p => p.id === postId);
    if (!postToDelete) return;

    // Check if it was original post (OP #1)
    const thread = threads.find(t => t.id === postToDelete.threadId);
    if (!thread) return;

    // Find chronological thread posts
    const threadPosts = posts
      .filter(p => p.threadId === thread.id)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    const isOP = threadPosts[0]?.id === postId;

    if (isOP) {
      // Deleting original post deletes the whole thread!
      handleDeleteThread(thread.id);
    } else {
      // Remove post
      setPosts(prev => prev.filter(p => p.id !== postId));

      // Decrement thread replies count
      setThreads(prev => 
        prev.map(t => {
          if (t.id === thread.id) {
            return {
              ...t,
              repliesCount: Math.max(0, t.repliesCount - 1)
            };
          }
          return t;
        })
      );

      // Decrement subforum post counters
      setSubforums(prev => 
        prev.map(sub => {
          if (sub.id === thread.subforumId) {
            return {
              ...sub,
              postsCount: Math.max(0, sub.postsCount - 1)
            };
          }
          return sub;
        })
      );

      // Audit logs
      const log: AuditLog = {
        id: `log-${Date.now()}`,
        userId: currentUser.id,
        username: currentUser.username,
        action: 'Eliminazione Risposta',
        target: `Messaggio ID: ${postId} nella discussione "${thread.title}"`,
        timestamp: new Date().toISOString()
      };
      setAuditLogs(prev => [log, ...prev]);
    }
  };

  // Edit in-place post
  const handleEditPost = (postId: string, newContent: string) => {
    setPosts(prev => 
      prev.map(p => {
        if (p.id === postId) {
          return { ...p, content: newContent };
        }
        return p;
      })
    );
  };

  // -------------------------
  // ADMIN CP DATABASE SEEDING MODS
  // -------------------------

  // Create Category
  const handleAddCategory = (name: string) => {
    const newCatId = `cat-${Date.now()}`;
    const newCat: Category = {
      id: newCatId,
      name,
      order: categories.length + 1
    };

    setCategories(prev => [...prev, newCat]);

    // Audit log
    const log: AuditLog = {
      id: `log-${Date.now()}`,
      userId: currentUser.id,
      username: currentUser.username,
      action: 'Creazione Categoria',
      target: `Nuova cat: "${name}"`,
      timestamp: new Date().toISOString()
    };
    setAuditLogs(prev => [log, ...prev]);
  };

  // Delete Category
  const handleDeleteCategory = (catId: string) => {
    const target = categories.find(c => c.id === catId);
    setCategories(prev => prev.filter(c => c.id !== catId));

    // Audit log
    const log: AuditLog = {
      id: `log-${Date.now()}`,
      userId: currentUser.id,
      username: currentUser.username,
      action: 'Eliminazione Categoria',
      target: `Cancellata cat: "${target ? target.name : catId}"`,
      timestamp: new Date().toISOString()
    };
    setAuditLogs(prev => [log, ...prev]);
  };

  // Create Subforum
  const handleAddSubforum = (name: string, desc: string, catId: string) => {
    const newSubId = `sub-${Date.now()}`;
    const newSub: Subforum = {
      id: newSubId,
      categoryId: catId,
      name,
      description: desc,
      threadsCount: 0,
      postsCount: 0,
      lastPost: null
    };

    setSubforums(prev => [...prev, newSub]);

    // Audit log
    const log: AuditLog = {
      id: `log-${Date.now()}`,
      userId: currentUser.id,
      username: currentUser.username,
      action: 'Creazione Subforum',
      target: `Registrato forum: "${name}"`,
      timestamp: new Date().toISOString()
    };
    setAuditLogs(prev => [log, ...prev]);
  };

  // Delete Subforum
  const handleDeleteSubforum = (subId: string) => {
    const target = subforums.find(s => s.id === subId);
    setSubforums(prev => prev.filter(s => s.id !== subId));

    // Also remove any threads and posts belonging to deleted subforum
    const linkedThreads = threads.filter(t => t.subforumId === subId);
    const linkedThreadIds = linkedThreads.map(t => t.id);

    setThreads(prev => prev.filter(t => t.subforumId !== subId));
    setPosts(prev => prev.filter(p => !linkedThreadIds.includes(p.threadId)));

    // Audit log
    const log: AuditLog = {
      id: `log-${Date.now()}`,
      userId: currentUser.id,
      username: currentUser.username,
      action: 'Eliminazione Subforum',
      target: `Rimosso forum: "${target ? target.name : subId}"`,
      timestamp: new Date().toISOString()
    };
    setAuditLogs(prev => [log, ...prev]);
  };

  // -------------------------
  // MEMBERS & PROFILE CONTROL
  // -------------------------

  // Edit current profile inputs
  const handleUpdateProfile = (avatar: string, customTitle: string, userLoc: string, userSig: string) => {
    setUsers(prev => 
      prev.map(u => {
        if (u.id === currentUser.id) {
          const updated = {
            ...u,
            avatarUrl: avatar,
            title: customTitle,
            location: userLoc,
            signature: userSig
          };
          setCurrentUser(updated);
          return updated;
        }
        return u;
      })
    );
  };

  // Change user role/state (Admin CP action)
  const handleUpdateUserRole = (userId: string, role: string, customTitle: string) => {
    setUsers(prev => 
      prev.map(u => {
        if (u.id === userId) {
          const updated = {
            ...u,
            role,
            title: customTitle
          };

          // If edited user is the current user under active simulation, sync it
          if (userId === currentUser.id) {
            setCurrentUser(updated);
          }

          // Generate audit log entry
          const log: AuditLog = {
            id: `log-${Date.now()}`,
            userId: currentUser.id,
            username: currentUser.username,
            action: 'Modifica Privilegi',
            target: `Utente: "${u.username}" inserito a ruolo ${role.toUpperCase()}`,
            timestamp: new Date().toISOString()
          };
          setAuditLogs(prevLogs => [log, ...prevLogs]);

          return updated;
        }
        return u;
      })
    );
  };

  const handleAddUser = (username: string, role: string) => {
    const newUser: User = {
      id: `user-${Date.now()}`,
      username,
      role,
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      title: '',
      registeredAt: new Date().toISOString().split('T')[0],
      location: '',
      postCount: 0,
      likesCount: 0,
      signature: '',
      isOnline: false
    };
    setUsers(prev => [...prev, newUser]);
  };

  const handleDeleteUser = (userId: string) => {
    if (userId === currentUser.id) return; // Prevent deleting self
    setUsers(prev => prev.filter(u => u.id !== userId));
  };

  const handleAddUserGroup = (name: string, colorClass: string, isAdmin: boolean, isMod: boolean) => {
    const newGroup: UserGroup = {
      id: `group-${Date.now()}`,
      name,
      colorClass,
      isAdmin,
      isMod
    };
    setUserGroups(prev => [...prev, newGroup]);
  };

  const handleDeleteUserGroup = (groupId: string) => {
    setUserGroups(prev => prev.filter(g => g.id !== groupId));
  };

  // -------------------------
  // RENDER SELECTION LAYOUTS
  // -------------------------

  const activeSubforum = subforums.find(s => s.id === selectedSubforumId);
  const activeThread = threads.find(t => t.id === selectedThreadId);
  const activeSubforumCategory = activeSubforum ? categories.find(c => c.id === activeSubforum.categoryId) : undefined;

  let mainContent;

  if (activeTab === 'members') {
    mainContent = <MembersPage users={users} userGroups={userGroups} />;
  } else if (activeTab === 'profile') {
    mainContent = <ProfilePage currentUser={currentUser} onUpdateProfile={handleUpdateProfile} />;
  } else if (activeTab === 'admin') {
    mainContent = (
      <AdminCP
        currentUser={currentUser}
        categories={categories}
        subforums={subforums}
        users={users}
        userGroups={userGroups}
        auditLogs={auditLogs}
        onAddCategory={handleAddCategory}
        onDeleteCategory={handleDeleteCategory}
        onAddSubforum={handleAddSubforum}
        onDeleteSubforum={handleDeleteSubforum}
        onUpdateUserRole={handleUpdateUserRole}
        onAddUser={handleAddUser}
        onDeleteUser={handleDeleteUser}
        onAddUserGroup={handleAddUserGroup}
        onDeleteUserGroup={handleDeleteUserGroup}
      />
    );
  } else if (activeTab === 'search') {
    mainContent = (
      <SearchPage
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        threads={threads}
        posts={posts}
        users={users}
        userGroups={userGroups}
        subforums={subforums}
        onSelectThread={handleSelectThread}
      />
    );
  } else {
    // Tab is 'forum'
    if (activeThread && activeSubforum) {
      mainContent = (
        <ThreadPage
          thread={activeThread}
          subforum={activeSubforum}
          category={activeSubforumCategory}
          posts={posts}
          users={users}
          userGroups={userGroups}
          currentUser={currentUser}
          onGoBack={handleGoBack}
          onAddReply={handleAddReply}
          onLikePost={handleLikePost}
          onToggleSticky={handleToggleSticky}
          onToggleLocked={handleToggleLocked}
          onDeleteThread={handleDeleteThread}
          onDeletePost={handleDeletePost}
          onEditPost={handleEditPost}
        />
      );
    } else if (activeSubforum) {
      mainContent = (
        <SubforumPage
          subforum={activeSubforum}
          category={activeSubforumCategory}
          threads={threads}
          posts={posts}
          users={users}
          userGroups={userGroups}
          currentUser={currentUser}
          onGoBack={handleGoBack}
          onSelectThread={handleSelectThread}
          onAddNewThread={handleAddNewThread}
        />
      );
    } else {
      mainContent = (
        <ForumHome
          categories={categories}
          subforums={subforums}
          threads={threads}
          posts={posts}
          users={users}
          userGroups={userGroups}
          currentUser={currentUser}
          onSelectSubforum={handleSelectSubforum}
          onSelectThread={handleSelectThread}
        />
      );
    }
  }

  return (
    <div className="bg-[#e1e1e2] min-h-screen text-[#333] pb-12 font-sans overflow-x-hidden flex flex-col justify-between selection:bg-[#ff9900]/20 selection:text-[#1c3c5a]">
      
      {/* Dynamic Header */}
      <div>
        <Header
          currentUser={currentUser}
          users={users}
          userGroups={userGroups}
          onSelectUser={handleSelectUser}
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            // Clicking navigation tab resets subforum/thread drill down views!
            setSelectedSubforumId(null);
            setSelectedThreadId(null);
          }}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        {/* Global Inner Container */}
        <main className="max-w-7xl mx-auto px-6 mt-6">
          {mainContent}
        </main>
      </div>

      {/* Classic vBulletin Forum Footer */}
      <footer className="max-w-7xl mx-auto w-full mt-12 bg-white border border-gray-300 px-6 py-4 flex flex-col md:flex-row justify-between items-center text-[10px] text-gray-500 select-none">
        <div className="flex flex-wrap gap-3 text-[#3e70a7] font-semibold">
          <button onClick={() => { setActiveTab('forum'); setSelectedSubforumId(null); setSelectedThreadId(null); }} className="hover:underline">Indice Forum</button>
          <span>|</span>
          <button onClick={() => setActiveTab('members')} className="hover:underline">Membri</button>
          <span>|</span>
          <button onClick={() => setActiveTab('profile')} className="hover:underline">Il Mio Profilo</button>
          <span>|</span>
          <button onClick={() => setActiveTab('admin')} className="hover:underline">Amministrazione</button>
        </div>
        <div className="text-center md:text-right mt-2 md:mt-0 space-y-0.5">
          <div>Powered by <span className="font-bold text-gray-700">vB-PHP CMS</span> v4.2.5 &copy; {new Date().getFullYear()}. Tutti i diritti riservati.</div>
          <p className="text-[9px] text-gray-400">Database offline (localStorage). Sviluppato con React, TypeScript e Tailwind CSS.</p>
        </div>
      </footer>

    </div>
  );
}
