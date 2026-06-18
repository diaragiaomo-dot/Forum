/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface UserGroup {
  id: string;
  name: string;
  colorClass: string;
  isAdmin: boolean;
  isMod: boolean;
}

export interface User {
  id: string;
  username: string;
  role: string;
  avatarUrl: string;
  title: string;
  registeredAt: string;
  location: string;
  postCount: number;
  likesCount: number;
  signature: string;
  isOnline: boolean;
}

export interface Post {
  id: string;
  threadId: string;
  userId: string;
  content: string;
  createdAt: string;
  likes: string[]; // User IDs who liked this post
}

export interface Thread {
  id: string;
  subforumId: string;
  title: string;
  userId: string;
  createdAt: string;
  isSticky: boolean;
  isLocked: boolean;
  repliesCount: number;
  viewsCount: number;
  lastPostAt: string;
  lastPostUserId: string;
  lastPostUsername: string;
}

export interface Subforum {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  threadsCount: number;
  postsCount: number;
  lastPost: {
    threadId: string;
    threadTitle: string;
    userId: string;
    username: string;
    createdAt: string;
  } | null;
}

export interface Category {
  id: string;
  name: string;
  order: number;
}

export interface AuditLog {
  id: string;
  userId: string;
  username: string;
  action: string;
  target: string;
  timestamp: string;
}
