"use client";
import * as React from 'react';

export type ToastMessage = { id: number; message: React.ReactNode; duration: number };
let messages: ToastMessage[] = [];
let nextId = 0;
const listeners = new Set<() => void>();
const empty: ToastMessage[] = [];
function emit() { listeners.forEach(listener => listener()); }
export function dismissToast(id?: number) {
  messages = id === undefined ? [] : messages.filter(item => item.id !== id);
  emit();
}
export function toast(message: React.ReactNode, options: { duration?: number } = {}) {
  const id = ++nextId;
  messages = [...messages, { id, message, duration: options.duration ?? 3000 }].slice(-3);
  emit();
  return { id, dismiss: () => dismissToast(id) };
}
export function useToast(duration = 3000) {
  const notify = React.useCallback((message: React.ReactNode) => { toast(message, { duration }); }, [duration]);
  return { toast: notify, dismiss: dismissToast };
}
export function useToastMessages() {
  return React.useSyncExternalStore(listener => { listeners.add(listener); return () => { listeners.delete(listener); }; }, () => messages, () => empty);
}
