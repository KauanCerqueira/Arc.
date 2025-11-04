"use client";

import React from "react";
import Link from "next/link";
import { useNotifications } from "@/core/hooks/useNotifications";
import { Check, Filter, Search, ArrowRight, Dot, ThumbsUp, ThumbsDown, MessageCircle } from "lucide-react";

type LocalReadMap = Record<string, boolean>;
type Reaction = { likes: number; dislikes: number; self: "like" | "dislike" | null };
type Comment = { id: string; author: string; text: string; at: Date };

function timeAgo(date: Date) {
  const diff = (Date.now() - date.getTime()) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

export default function NotificationsInboxPage() {
  const { notifications } = useNotifications();
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [query, setQuery] = React.useState("");
  const [localRead, setLocalRead] = React.useState<LocalReadMap>({});
  const [commentDraft, setCommentDraft] = React.useState<string>("");
  const [comments, setComments] = React.useState<Record<string, Comment[]>>({});
  const [reactions, setReactions] = React.useState<Record<string, Reaction>>({});

  const filtered = notifications.filter((n) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      n.title.toLowerCase().includes(q) ||
      n.message.toLowerCase().includes(q) ||
      n.pageName.toLowerCase().includes(q)
    );
  });

  const selected = filtered.find((n) => n.id === selectedId) || filtered[0] || null;

  React.useEffect(() => {
    if (!selectedId && filtered.length > 0) setSelectedId(filtered[0].id);
  }, [filtered.length, selectedId]);

  const markAsRead = (id: string) => setLocalRead((m) => ({ ...m, [id]: true }));
  const markAsUnread = (id: string) => setLocalRead((m) => ({ ...m, [id]: false }));
  const isRead = (id: string) => localRead[id] || false;

  const priorityColor: Record<string, string> = {
    critical: "text-red-500",
    high: "text-amber-500",
    medium: "text-blue-500",
    low: "text-slate-400",
  };

  const toggleReaction = (id: string, kind: "like" | "dislike") => {
    setReactions((r) => {
      const current: Reaction = r[id] || { likes: 0, dislikes: 0, self: null };
      let { likes, dislikes, self } = current;
      if (kind === "like") {
        if (self === "like") { likes -= 1; self = null; }
        else { likes += 1; if (self === "dislike") dislikes -= 1; self = "like"; }
      } else {
        if (self === "dislike") { dislikes -= 1; self = null; }
        else { dislikes += 1; if (self === "like") likes -= 1; self = "dislike"; }
      }
      return { ...r, [id]: { likes: Math.max(0, likes), dislikes: Math.max(0, dislikes), self } };
    });
  };

  const submitComment = (id: string) => {
    const text = commentDraft.trim();
    if (!text) return;
    const newComment: Comment = { id: `${Date.now()}`, author: "Você", text, at: new Date() };
    setComments((c) => ({ ...c, [id]: [ ...(c[id] || []), newComment ] }));
    setCommentDraft("");
  };

  return (
    <div className="w-full h-full grid grid-cols-1 md:grid-cols-12 bg-arc-primary">
      {/* Lista */}
      <aside className="md:col-span-5 lg:col-span-4 border-r border-arc h-[calc(100vh-0px)] overflow-auto">
        <div className="sticky top-0 z-10 bg-arc-primary px-3 py-2 border-b border-arc flex items-center gap-2">
          <h2 className="text-sm font-semibold text-arc flex-1">Inbox</h2>
          <button className="p-2 rounded-md hover:bg-arc-secondary" title="Filtros">
            <Filter className="w-4 h-4" />
          </button>
        </div>
        <div className="p-3 pt-2">
          <div className="relative mb-3">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-arc-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar notificações"
              className="pl-8 pr-3 h-9 w-full rounded-md border border-arc bg-arc-secondary text-sm outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-slate-700"
            />
          </div>

          <ul className="space-y-1">
            {filtered.map((n) => (
              <li key={n.id}>
                <button
                  onClick={() => setSelectedId(n.id)}
                  className={[
                    "w-full text-left px-3 py-2 rounded-md border border-transparent",
                    selectedId === n.id ? "bg-arc-secondary border-arc" : "hover:bg-arc-secondary",
                  ].join(" ")}
                >
                  <div className="flex items-center gap-2">
                    <Dot className={["w-5 h-5", priorityColor[n.priority]].join(" ")} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium text-arc truncate">{n.title}</span>
                        <span className="text-xs text-arc-muted whitespace-nowrap">{timeAgo(n.timestamp)}</span>
                      </div>
                      <div className="text-xs text-arc-muted truncate">{n.message}</div>
                    </div>
                    {!isRead(n.id) && <span className="ml-auto w-2 h-2 bg-blue-500 rounded-full" />}
                  </div>
                </button>
              </li>
            ))}
            {filtered.length === 0 && <li className="text-sm text-arc-muted px-3 py-6">Sem notificações</li>}
          </ul>
        </div>
      </aside>

      {/* Detalhe */}
      <section className="md:col-span-7 lg:col-span-8 h-[calc(100vh-0px)] overflow-auto">
        {selected ? (
          <div className="p-4 md:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-xs text-arc-muted">{selected.pageName}</div>
              <div className="flex items-center gap-2">
                {!isRead(selected.id) ? (
                  <button
                    className="inline-flex items-center gap-1 text-xs border border-arc rounded-md px-2 py-1 hover:bg-arc-secondary"
                    onClick={() => markAsRead(selected.id)}
                  >
                    <Check className="w-3 h-3" /> Marcar como lida
                  </button>
                ) : (
                  <button
                    className="inline-flex items-center gap-1 text-xs border border-arc rounded-md px-2 py-1 hover:bg-arc-secondary"
                    onClick={() => markAsUnread(selected.id)}
                  >
                    Marcar como não lida
                  </button>
                )}
              </div>
            </div>
            <h1 className="text-lg font-semibold text-arc">{selected.title}</h1>
            <p className="text-sm text-arc-muted whitespace-pre-wrap">{selected.message}</p>

            <div className="flex items-center gap-3 pt-1">
              <button
                className={`inline-flex items-center gap-1 text-xs rounded-md px-2 py-1 border ${reactions[selected.id]?.self==='like' ? 'bg-arc-secondary border-arc' : 'border-arc hover:bg-arc-secondary'}`}
                onClick={() => toggleReaction(selected.id, 'like')}
              >
                <ThumbsUp className="w-3.5 h-3.5" /> {reactions[selected.id]?.likes ?? 0}
              </button>
              <button
                className={`inline-flex items-center gap-1 text-xs rounded-md px-2 py-1 border ${reactions[selected.id]?.self==='dislike' ? 'bg-arc-secondary border-arc' : 'border-arc hover:bg-arc-secondary'}`}
                onClick={() => toggleReaction(selected.id, 'dislike')}
              >
                <ThumbsDown className="w-3.5 h-3.5" /> {reactions[selected.id]?.dislikes ?? 0}
              </button>
              <Link
                href={`/workspace/group/${selected.groupId}/page/${selected.pageId}`}
                className="inline-flex items-center gap-1 text-xs border border-arc rounded-md px-2 py-1 hover:bg-arc-secondary ml-auto"
              >
                Abrir página <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="mt-2 border-t border-arc pt-3 space-y-3">
              <div className="flex items-center gap-2 text-xs text-arc-muted">
                <MessageCircle className="w-3.5 h-3.5" /> Comentários
              </div>
              {/* Lista de comentários */}
              <div className="space-y-2">
                {(comments[selected.id] || []).map((c) => (
                  <div key={c.id} className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-full bg-arc-secondary flex items-center justify-center text-[10px] font-semibold">{c.author.substring(0,2).toUpperCase()}</div>
                    <div className="flex-1">
                      <div className="text-xs text-arc-muted">{c.author} • {timeAgo(c.at)}</div>
                      <div className="text-sm text-arc whitespace-pre-wrap">{c.text}</div>
                    </div>
                  </div>
                ))}
                {(comments[selected.id] || []).length === 0 && (
                  <div className="text-xs text-arc-muted">Sem comentários ainda.</div>
                )}
              </div>

              {/* Caixa de comentário */}
              <div>
                <label className="text-xs text-arc-muted">Deixe um comentário</label>
                <textarea
                  className="mt-1 w-full min-h-24 rounded-md border border-arc bg-arc-secondary p-2 text-sm outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-slate-700"
                  placeholder="Escreva algo..."
                  value={commentDraft}
                  onChange={(e) => setCommentDraft(e.target.value)}
                />
                <div className="flex items-center justify-end mt-2">
                  <button
                    className="px-3 py-1.5 text-sm rounded-md bg-gray-900 text-white dark:bg-white dark:text-gray-900 hover:opacity-90"
                    onClick={() => selected && submitComment(selected.id)}
                  >
                    Enviar
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 text-sm text-arc-muted">Selecione uma notificação</div>
        )}
      </section>
    </div>
  );
}
