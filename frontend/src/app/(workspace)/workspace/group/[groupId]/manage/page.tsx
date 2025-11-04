"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useWorkspaceStore } from "@/core/store/workspaceStore";
import DashboardTemplate from "@/app/(workspace)/templates/dashboard";
import { Folder, Briefcase, Rocket, Tag, ListChecks, Users, Calendar as CalendarIcon, Star, ArrowLeft, Trash2, Save } from "lucide-react";

const iconOptions = [
  { key: "folder", Icon: Folder, label: "Pasta" },
  { key: "briefcase", Icon: Briefcase, label: "Projetos" },
  { key: "rocket", Icon: Rocket, label: "Lançamentos" },
  { key: "tag", Icon: Tag, label: "Tags" },
  { key: "list", Icon: ListChecks, label: "Tarefas" },
  { key: "users", Icon: Users, label: "Equipe" },
  { key: "calendar", Icon: CalendarIcon, label: "Agenda" },
  { key: "star", Icon: Star, label: "Favoritos" },
];

const colorOptions = ["#0ea5e9", "#8b5cf6", "#f59e0b", "#10b981", "#ef4444", "#d946ef", "#14b8a6", "#64748b"];

export default function ManageGroupPage() {
  const params = useParams<{ groupId: string }>();
  const router = useRouter();
  const { getGroup, updateGroup, deleteGroup } = useWorkspaceStore();

  const groupId = params?.groupId as string;
  const group = getGroup(groupId);

  const [icon, setIcon] = React.useState<string | undefined>(group?.icon);
  const [color, setColor] = React.useState<string | undefined>(group?.color);

  React.useEffect(() => {
    if (group) {
      setIcon(group.icon);
      setColor(group.color);
    }
  }, [groupId]);

  if (!group) {
    return (
      <div className="p-6">
        <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-sm text-arc hover:underline">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>
        <div className="mt-4 text-arc-muted">Grupo não encontrado.</div>
      </div>
    );
  }

  const CurrentIcon = (iconOptions.find((o) => o.key === icon)?.Icon || Folder) as React.ComponentType<any>;

  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ backgroundColor: "transparent" }}>
            <CurrentIcon className="w-5 h-5" style={{ color: color || undefined }} />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg md:text-xl font-semibold text-arc truncate max-w-[32rem]">Gerenciar grupo: {group.name}</h1>
            <div className="text-xs text-arc-muted">{group.pages.length} páginas • Criado em {group.createdAt.toLocaleDateString()}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-md text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            onClick={async () => {
              const ok = window.confirm("Tem certeza que deseja excluir este grupo?");
              if (!ok) return;
              await deleteGroup(groupId);
              router.push("/workspace");
            }}
          >
            <Trash2 className="w-4 h-4" /> Excluir grupo
          </button>
          <button
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-md border border-arc hover:bg-gray-50 dark:hover:bg-slate-800"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4" /> Voltar
          </button>
        </div>
      </div>

      {/* Editor de ícone/cor */}
      <div className="border border-arc rounded-lg bg-arc-secondary p-4">
        <div className="text-sm font-semibold text-arc mb-2">Aparência do grupo</div>
        <div className="text-xs text-arc-muted mb-2">Ícone</div>
        <div className="grid grid-cols-8 md:grid-cols-12 gap-2 mb-4">
          {iconOptions.map(({ key, Icon }) => (
            <button
              key={key}
              className={`flex items-center justify-center w-9 h-9 rounded-md border ${icon === key ? "border-arc bg-arc-secondary" : "border-transparent hover:bg-gray-50 dark:hover:bg-slate-800"}`}
              onClick={() => setIcon(key)}
              title={key}
            >
              <Icon className="w-5 h-5" />
            </button>
          ))}
        </div>
        <div className="text-xs text-arc-muted mb-2">Cor do ícone</div>
        <div className="grid grid-cols-8 md:grid-cols-12 gap-2 mb-4">
          {colorOptions.map((hex) => (
            <button
              key={hex}
              className={`w-7 h-7 rounded-full border ${color === hex ? "border-arc" : "border-transparent"} hover:opacity-90`}
              style={{ backgroundColor: hex }}
              onClick={() => setColor(hex)}
              aria-label={`Cor ${hex}`}
            />
          ))}
        </div>

        <div className="flex items-center justify-end gap-2">
          <button
            className="px-3 py-1.5 text-sm rounded-md bg-gray-900 text-white dark:bg-white dark:text-gray-900 hover:opacity-90 inline-flex items-center gap-2"
            onClick={async () => {
              await updateGroup(groupId, { icon, color });
            }}
          >
            <Save className="w-4 h-4" /> Salvar alterações
          </button>
        </div>
      </div>

      {/* Dashboard do grupo */}
      <div className="mt-2">
        <DashboardTemplate groupId={groupId} pageId="" />
      </div>
    </div>
  );
}
