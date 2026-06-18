/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Category, Subforum, Thread, Post, User, AuditLog, UserGroup } from './types';

// Seed User Groups
export const SEED_GROUPS: UserGroup[] = [
  { id: 'admin', name: 'Amministratori', colorClass: 'text-red-700 font-bold', isAdmin: true, isMod: true },
  { id: 'mod', name: 'Moderatori', colorClass: 'text-green-700 font-bold', isAdmin: false, isMod: true },
  { id: 'member', name: 'Utenti Registrati', colorClass: 'text-blue-700 font-bold', isAdmin: false, isMod: false },
];

// Seed Users
export const SEED_USERS: User[] = [
  {
    id: 'admin-giacomo',
    username: 'Giacomo_Admin',
    role: 'admin',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    title: 'Co-Founder & Lead Webmaster',
    registeredAt: '2022-04-12',
    location: 'Roma, Italia',
    postCount: 0,
    likesCount: 0,
    signature: '',
    isOnline: true,
  }
];

// Seed Categories
export const SEED_CATEGORIES: Category[] = [
  { id: 'cat-main', name: '📢 Annunci & Community', order: 1 },
  { id: 'cat-offtopic', name: '☕ Zona Relax & Off-Topic', order: 2 },
];

// Seed Subforums
export const SEED_SUBFORUMS: Subforum[] = [
  {
    id: 'sub-news',
    categoryId: 'cat-main',
    name: 'Ultime Notizie',
    description: 'Le ultime notizie e annunci sullo sviluppo del forum e sulle novità della board.',
    threadsCount: 0,
    postsCount: 0,
    lastPost: null,
  },
  {
    id: 'sub-welcome',
    categoryId: 'cat-main',
    name: 'Benvenuto',
    description: 'Sei nuovo? Entra qui e presentati alla community!',
    threadsCount: 0,
    postsCount: 0,
    lastPost: null,
  },
  {
    id: 'sub-bar',
    categoryId: 'cat-offtopic',
    name: 'Il Bar del Forum',
    description: 'Discussioni libere, attualità, di tutto un po\' e tutto ciò che non trova spazio altrove.',
    threadsCount: 0,
    postsCount: 0,
    lastPost: null,
  }
];

// Seed Threads
export const SEED_THREADS: Thread[] = [];

// Seed Posts (Associated with threads)
export const SEED_POSTS: Post[] = [];

// Seed Audit Logs
export const SEED_AUDIT_LOGS: AuditLog[] = [];

// LocalStorage helpers
const KEY_PREFIX = 'vbulletin_forum_empty_v1_';

export function getStoredData() {
  try {
    const categories = localStorage.getItem(`${KEY_PREFIX}categories`);
    const subforums = localStorage.getItem(`${KEY_PREFIX}subforums`);
    const threads = localStorage.getItem(`${KEY_PREFIX}threads`);
    const posts = localStorage.getItem(`${KEY_PREFIX}posts`);
    const users = localStorage.getItem(`${KEY_PREFIX}users`);
    const userGroups = localStorage.getItem(`${KEY_PREFIX}groups`);
    const auditLogs = localStorage.getItem(`${KEY_PREFIX}auditLogs`);
    const currentUser = localStorage.getItem(`${KEY_PREFIX}currentUser`);

    if (categories && subforums && threads && posts && users && userGroups && auditLogs) {
      return {
        categories: JSON.parse(categories) as Category[],
        subforums: JSON.parse(subforums) as Subforum[],
        threads: JSON.parse(threads) as Thread[],
        posts: JSON.parse(posts) as Post[],
        users: JSON.parse(users) as User[],
        userGroups: JSON.parse(userGroups) as UserGroup[],
        auditLogs: JSON.parse(auditLogs) as AuditLog[],
        currentUser: currentUser ? JSON.parse(currentUser) as User : SEED_USERS[0],
      };
    }
  } catch (e) {
    console.error('Error loading stored forum data, fallback to seeds', e);
  }

  // Calculate some counts for initial seeds on first load
  const initialSubforums = [...SEED_SUBFORUMS];
  const initialThreads = [...SEED_THREADS];
  const initialPosts = [...SEED_POSTS];
  const initialUsers = [...SEED_USERS];
  const initialGroups = [...SEED_GROUPS];

  // Map subforum counts dynamically
  initialSubforums.forEach(sub => {
    const subThreads = initialThreads.filter(t => t.subforumId === sub.id);
    const subThreadIds = subThreads.map(t => t.id);
    const subPosts = initialPosts.filter(p => subThreadIds.includes(p.threadId));
    
    sub.threadsCount = subThreads.length;
    sub.postsCount = subPosts.length;

    // Find last post for this subforum
    if (subThreads.length > 0) {
      const sortedSubThreads = [...subThreads].sort((a, b) => new Date(b.lastPostAt).getTime() - new Date(a.lastPostAt).getTime());
      const lastThread = sortedSubThreads[0];
      const matchingPosts = initialPosts.filter(p => p.threadId === lastThread.id);
      const sortedPosts = [...matchingPosts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      const lastP = sortedPosts[0] || null;

      if (lastP) {
        const author = initialUsers.find(u => u.id === lastP.userId);
        sub.lastPost = {
          threadId: lastThread.id,
          threadTitle: lastThread.title,
          userId: lastP.userId,
          username: author ? author.username : lastThread.lastPostUsername,
          createdAt: lastP.createdAt
        };
      }
    }
  });

  return {
    categories: SEED_CATEGORIES,
    subforums: initialSubforums,
    threads: initialThreads,
    posts: initialPosts,
    users: initialUsers,
    userGroups: initialGroups,
    auditLogs: SEED_AUDIT_LOGS,
    currentUser: SEED_USERS[0], // Default as Admin_Giacomo so they can see all admin/mod features instantly
  };
}

export function saveStoredData(
  categories: Category[],
  subforums: Subforum[],
  threads: Thread[],
  posts: Post[],
  users: User[],
  userGroups: UserGroup[],
  auditLogs: AuditLog[],
  currentUser: User
) {
  try {
    localStorage.setItem(`${KEY_PREFIX}categories`, JSON.stringify(categories));
    localStorage.setItem(`${KEY_PREFIX}subforums`, JSON.stringify(subforums));
    localStorage.setItem(`${KEY_PREFIX}threads`, JSON.stringify(threads));
    localStorage.setItem(`${KEY_PREFIX}posts`, JSON.stringify(posts));
    localStorage.setItem(`${KEY_PREFIX}users`, JSON.stringify(users));
    localStorage.setItem(`${KEY_PREFIX}groups`, JSON.stringify(userGroups));
    localStorage.setItem(`${KEY_PREFIX}auditLogs`, JSON.stringify(auditLogs));
    localStorage.setItem(`${KEY_PREFIX}currentUser`, JSON.stringify(currentUser));
  } catch (e) {
    console.error('Error saving forum data to localStorage', e);
  }
}
