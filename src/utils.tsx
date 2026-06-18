/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

// Format date in classic forum style: Today, Yesterday or DD-MM-YYYY
export function formatForumDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const checkDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());

    const pad = (num: number) => String(num).padStart(2, '0');
    const timeStr = `${pad(d.getHours())}:${pad(d.getMinutes())}`;

    if (checkDate.getTime() === today.getTime()) {
      return `Oggi, ${timeStr}`;
    } else if (checkDate.getTime() === yesterday.getTime()) {
      return `Ieri, ${timeStr}`;
    } else {
      const day = pad(d.getDate());
      const month = pad(d.getMonth() + 1);
      const year = d.getFullYear();
      return `${day}-${month}-${year}, ${timeStr}`;
    }
  } catch (e) {
    return dateString;
  }
}

// Map user roles to aesthetic styled colors and names
export function getUserRoleBadge(role: 'admin' | 'mod' | 'member') {
  switch (role) {
    case 'admin':
      return {
        label: 'Administrator',
        textClass: 'text-red-600 font-bold drop-shadow-[0_1px_1px_rgba(255,200,200,0.5)]',
        bgClass: 'bg-red-100 border-red-300 text-red-800',
        starCount: 5,
        starColor: 'text-red-500',
      };
    case 'mod':
      return {
        label: 'Moderator',
        textClass: 'text-green-600 font-semibold',
        bgClass: 'bg-green-100 border-green-300 text-green-800',
        starCount: 4,
        starColor: 'text-green-500',
      };
    default:
      return {
        label: 'Registered Member',
        textClass: 'text-blue-700 font-medium',
        bgClass: 'bg-slate-100 border-slate-300 text-slate-800',
        starCount: 2,
        starColor: 'text-yellow-500',
      };
  }
}

// Render reputation level based on post counts and likes
export function renderReputationDots(likesCount: number): { label: string; count: number; color: string } {
  if (likesCount >= 300) {
    return { label: 'un pilastro splendente della community', count: 5, color: 'bg-green-500 border-green-600' };
  } else if (likesCount >= 100) {
    return { label: 'un membro rinomato per la sua saggezza', count: 4, color: 'bg-green-500 border-green-600' };
  } else if (likesCount >= 50) {
    return { label: 'è sulla buona strada', count: 3, color: 'bg-green-400 border-green-500' };
  } else if (likesCount >= 10) {
    return { label: 'un utente amichevole', count: 2, color: 'bg-yellow-400 border-yellow-500' };
  } else {
    return { label: 'ha iniziato da poco', count: 1, color: 'bg-slate-300 border-slate-400' };
  }
}

// Safe BBCode Parser converting BBCode tags into HTML elements
export function parseBBCode(text: string): React.ReactNode[] {
  if (!text) return [];

  // Simple safe tokenizer and converter
  const lines = text.split('\n');
  
  return lines.map((line, lineIdx) => {
    let parts: React.ReactNode[] = [];
    
    // Check if whole line is inside [code]...[/code]
    if (line.trim().startsWith('[code]') && line.trim().endsWith('[/code]')) {
      const codeText = line.trim().substring(6, line.trim().length - 7);
      return (
        <pre key={lineIdx} className="bg-slate-800 text-amber-300 font-mono text-xs p-3 rounded-md border border-slate-700 my-2 overflow-x-auto select-all">
          <code>{codeText}</code>
        </pre>
      );
    }
    
    // State machine to parse BBCode tokens in single line
    let currentIndex = 0;
    let textBuffer = '';
    
    // Auxiliary function to push plain text if any
    const flushBuffer = () => {
      if (textBuffer) {
        parts.push(textBuffer);
        textBuffer = '';
      }
    };

    while (currentIndex < line.length) {
      if (line.startsWith('[b]', currentIndex)) {
        flushBuffer();
        const endIdx = line.indexOf('[/b]', currentIndex + 3);
        if (endIdx !== -1) {
          const inner = line.substring(currentIndex + 3, endIdx);
          parts.push(<strong key={currentIndex} className="font-bold">{inner}</strong>);
          currentIndex = endIdx + 4;
        } else {
          textBuffer += '[b]';
          currentIndex += 3;
        }
      } else if (line.startsWith('[i]', currentIndex)) {
        flushBuffer();
        const endIdx = line.indexOf('[/i]', currentIndex + 3);
        if (endIdx !== -1) {
          const inner = line.substring(currentIndex + 3, endIdx);
          parts.push(<em key={currentIndex} className="italic">{inner}</em>);
          currentIndex = endIdx + 4;
        } else {
          textBuffer += '[i]';
          currentIndex += 3;
        }
      } else if (line.startsWith('[u]', currentIndex)) {
        flushBuffer();
        const endIdx = line.indexOf('[/u]', currentIndex + 3);
        if (endIdx !== -1) {
          const inner = line.substring(currentIndex + 3, endIdx);
          parts.push(<span key={currentIndex} className="underline">{inner}</span>);
          currentIndex = endIdx + 4;
        } else {
          textBuffer += '[u]';
          currentIndex += 3;
        }
      } else if (line.startsWith('[hr]', currentIndex)) {
        flushBuffer();
        parts.push(<hr key={currentIndex} className="my-2 border-t border-dashed border-slate-300" />);
        currentIndex += 4;
      } else if (line.startsWith('[color=', currentIndex)) {
        flushBuffer();
        const colorEndIdx = line.indexOf(']', currentIndex + 7);
        if (colorEndIdx !== -1) {
          const colorValue = line.substring(currentIndex + 7, colorEndIdx);
          const valEndIdx = line.indexOf('[/color]', colorEndIdx + 1);
          if (valEndIdx !== -1) {
            const inner = line.substring(colorEndIdx + 1, valEndIdx);
            // Apply color classes safely or custom colors
            let styleColor = colorValue === 'blue' ? '#2563EB' : colorValue === 'green' ? '#16A34A' : colorValue === 'red' ? '#DC2626' : colorValue;
            parts.push(<span key={currentIndex} style={{ color: styleColor }}>{inner}</span>);
            currentIndex = valEndIdx + 8;
          } else {
            textBuffer += `[color=${colorValue}]`;
            currentIndex = colorEndIdx + 1;
          }
        } else {
          textBuffer += '[color=';
          currentIndex += 7;
        }
      } else {
        textBuffer += line[currentIndex];
        currentIndex++;
      }
    }
    
    flushBuffer();

    // If there is code block formatting we should respect it
    if (line.trim().startsWith('[code]') || text.includes('[code]')) {
      // Inline parser check
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('[code]')) {
        return (
          <div key={lineIdx} className="bg-slate-900 border border-slate-700 text-amber-200 font-mono text-xs rounded p-3 my-1 overflow-x-auto select-all">
            {trimmedLine.replace('[code]', '').replace('[/code]', '')}
          </div>
        );
      }
    }

    // Default return of parsed elements
    return (
      <div key={lineIdx} className="min-h-[1.2rem]">
        {parts.length > 0 ? parts : ' '}
      </div>
    );
  });
}
