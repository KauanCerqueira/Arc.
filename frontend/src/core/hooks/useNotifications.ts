import { useMemo } from 'react';
import { useWorkspaceStore } from '@/core/store/workspaceStore';

export type Notification = {
  id: string;
  type: 'overdue' | 'due_soon' | 'event_today' | 'event_tomorrow' | 'high_priority' | 'bug_critical';
  title: string;
  message: string;
  pageId: string;
  pageName: string;
  groupId: string;
  timestamp: Date;
  priority: 'low' | 'medium' | 'high' | 'critical';
  icon: string;
  read: boolean;
};

export function useNotifications() {
  const { workspace } = useWorkspaceStore();

  const notifications = useMemo((): Notification[] => {
    if (!workspace) return [];

    const notifs: Notification[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    workspace.groups.forEach(group => {
      group.pages.forEach(page => {
        const data = page.data || {};

        // Notificações de tarefas
        if (page.template === 'tasks') {
          const tasks = data.tasks || [];

          tasks.forEach((task: any, idx: number) => {
            if (task.completed) return;

            if (task.dueDate) {
              const dueDate = new Date(task.dueDate);
              dueDate.setHours(0, 0, 0, 0);

              // Tarefas atrasadas
              if (dueDate < today) {
                notifs.push({
                  id: `overdue-task-${page.id}-${idx}`,
                  type: 'overdue',
                  title: 'Tarefa Atrasada',
                  message: `"${task.title}" está atrasada`,
                  pageId: page.id,
                  pageName: page.name,
                  groupId: group.id,
                  timestamp: new Date(),
                  priority: 'critical',
                  icon: '🚨',
                  read: false,
                });
              }
              // Tarefas que vencem hoje
              else if (dueDate.getTime() === today.getTime()) {
                notifs.push({
                  id: `due-today-task-${page.id}-${idx}`,
                  type: 'due_soon',
                  title: 'Tarefa Vence Hoje',
                  message: `"${task.title}" vence hoje`,
                  pageId: page.id,
                  pageName: page.name,
                  groupId: group.id,
                  timestamp: new Date(),
                  priority: 'high',
                  icon: '⏰',
                  read: false,
                });
              }
              // Tarefas que vencem amanhã
              else if (dueDate.getTime() === tomorrow.getTime()) {
                notifs.push({
                  id: `due-tomorrow-task-${page.id}-${idx}`,
                  type: 'due_soon',
                  title: 'Tarefa Vence Amanhã',
                  message: `"${task.title}" vence amanhã`,
                  pageId: page.id,
                  pageName: page.name,
                  groupId: group.id,
                  timestamp: new Date(),
                  priority: 'medium',
                  icon: '📅',
                  read: false,
                });
              }
            }

            // Tarefas de alta prioridade sem prazo
            if (task.priority === 'high' && !task.dueDate) {
              notifs.push({
                id: `high-priority-task-${page.id}-${idx}`,
                type: 'high_priority',
                title: 'Tarefa Prioritária',
                message: `"${task.title}" tem prioridade alta`,
                pageId: page.id,
                pageName: page.name,
                groupId: group.id,
                timestamp: new Date(),
                priority: 'medium',
                icon: '⚡',
                read: false,
              });
            }
          });
        }

        // Notificações de kanban
        if (page.template === 'kanban') {
          const cards = data.cards || [];

          cards.forEach((card: any, idx: number) => {
            if (card.status === 'done') return;

            if (card.dueDate) {
              const dueDate = new Date(card.dueDate);
              dueDate.setHours(0, 0, 0, 0);

              if (dueDate < today) {
                notifs.push({
                  id: `overdue-card-${page.id}-${idx}`,
                  type: 'overdue',
                  title: 'Card Atrasado',
                  message: `"${card.title}" está atrasado`,
                  pageId: page.id,
                  pageName: page.name,
                  groupId: group.id,
                  timestamp: new Date(),
                  priority: 'critical',
                  icon: '🚨',
                  read: false,
                });
              } else if (dueDate.getTime() === today.getTime()) {
                notifs.push({
                  id: `due-today-card-${page.id}-${idx}`,
                  type: 'due_soon',
                  title: 'Card Vence Hoje',
                  message: `"${card.title}" vence hoje`,
                  pageId: page.id,
                  pageName: page.name,
                  groupId: group.id,
                  timestamp: new Date(),
                  priority: 'high',
                  icon: '⏰',
                  read: false,
                });
              }
            }
          });
        }

        // Notificações de eventos
        if (page.template === 'calendar') {
          const events = data.events || [];

          events.forEach((event: any, idx: number) => {
            const eventDate = new Date(event.date);
            eventDate.setHours(0, 0, 0, 0);

            if (eventDate.getTime() === today.getTime()) {
              notifs.push({
                id: `event-today-${page.id}-${idx}`,
                type: 'event_today',
                title: 'Evento Hoje',
                message: `"${event.title || event.name}" é hoje`,
                pageId: page.id,
                pageName: page.name,
                groupId: group.id,
                timestamp: new Date(),
                priority: 'high',
                icon: '📅',
                read: false,
              });
            } else if (eventDate.getTime() === tomorrow.getTime()) {
              notifs.push({
                id: `event-tomorrow-${page.id}-${idx}`,
                type: 'event_tomorrow',
                title: 'Evento Amanhã',
                message: `"${event.title || event.name}" é amanhã`,
                pageId: page.id,
                pageName: page.name,
                groupId: group.id,
                timestamp: new Date(),
                priority: 'medium',
                icon: '📆',
                read: false,
              });
            }
          });
        }

        // Notificações de bugs críticos
        if (page.template === 'bugs') {
          const bugs = data.bugs || [];

          bugs.forEach((bug: any, idx: number) => {
            if (bug.status === 'resolved' || bug.status === 'closed') return;

            if (bug.severity === 'critical' || bug.severity === 'high') {
              notifs.push({
                id: `critical-bug-${page.id}-${idx}`,
                type: 'bug_critical',
                title: 'Bug Crítico',
                message: `"${bug.title}" - severidade ${bug.severity}`,
                pageId: page.id,
                pageName: page.name,
                groupId: group.id,
                timestamp: new Date(),
                priority: bug.severity === 'critical' ? 'critical' : 'high',
                icon: '🐛',
                read: false,
              });
            }
          });
        }
      });
    });

    // Ordenar por prioridade e timestamp
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return notifs.sort((a, b) => {
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return b.timestamp.getTime() - a.timestamp.getTime();
    });
  }, [workspace]);

  // Agrupar notificações por tipo
  const notificationsByType = useMemo(() => {
    return {
      critical: notifications.filter(n => n.priority === 'critical'),
      high: notifications.filter(n => n.priority === 'high'),
      medium: notifications.filter(n => n.priority === 'medium'),
      low: notifications.filter(n => n.priority === 'low'),
    };
  }, [notifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    notificationsByType,
    unreadCount,
    hasNotifications: notifications.length > 0,
    hasCritical: notificationsByType.critical.length > 0,
  };
}
