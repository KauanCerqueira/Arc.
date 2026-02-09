// Service para gerenciar interações com notificações
// Usa localStorage para persistir dados localmente

export type NotificationReaction = {
  likes: number;
  dislikes: number;
  userReaction: 'like' | 'dislike' | null;
};

export type NotificationComment = {
  id: string;
  author: string;
  avatar?: string;
  text: string;
  timestamp: number;
};

export type NotificationState = {
  read: boolean;
  pinned: boolean;
  archived: boolean;
  reactions: NotificationReaction;
  comments: NotificationComment[];
};

class NotificationsService {
  private readonly STORAGE_KEY = 'arc_notifications_data';
  private readonly UPDATE_EVENT = 'arc_notifications_updated';

  private getData(): Record<string, NotificationState> {
    if (typeof window === 'undefined') return {};

    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  private saveData(data: Record<string, NotificationState>): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
      // Disparar evento personalizado para notificar mudanças
      window.dispatchEvent(new CustomEvent(this.UPDATE_EVENT));
    } catch (error) {
      console.error('Error saving notifications data:', error);
    }
  }

  // Método para componentes ouvirem mudanças
  onUpdate(callback: () => void): () => void {
    if (typeof window === 'undefined') return () => {};

    const handler = () => callback();
    window.addEventListener(this.UPDATE_EVENT, handler);

    // Retorna função de cleanup
    return () => window.removeEventListener(this.UPDATE_EVENT, handler);
  }

  private getNotificationState(notificationId: string): NotificationState {
    const allData = this.getData();
    return allData[notificationId] || {
      read: false,
      pinned: false,
      archived: false,
      reactions: {
        likes: 0,
        dislikes: 0,
        userReaction: null,
      },
      comments: [],
    };
  }

  private setNotificationState(notificationId: string, state: NotificationState): void {
    const allData = this.getData();
    allData[notificationId] = state;
    this.saveData(allData);
  }

  // Read state
  isRead(notificationId: string): boolean {
    return this.getNotificationState(notificationId).read;
  }

  markAsRead(notificationId: string): void {
    const state = this.getNotificationState(notificationId);
    state.read = true;
    this.setNotificationState(notificationId, state);
  }

  markAsUnread(notificationId: string): void {
    const state = this.getNotificationState(notificationId);
    state.read = false;
    this.setNotificationState(notificationId, state);
  }

  markAllAsRead(notificationIds: string[]): void {
    const allData = this.getData();
    notificationIds.forEach(id => {
      const state = allData[id] || {
        read: false,
        pinned: false,
        archived: false,
        reactions: { likes: 0, dislikes: 0, userReaction: null },
        comments: [],
      };
      state.read = true;
      allData[id] = state;
    });
    this.saveData(allData);
  }

  // Pin state
  isPinned(notificationId: string): boolean {
    return this.getNotificationState(notificationId).pinned;
  }

  togglePin(notificationId: string): boolean {
    const state = this.getNotificationState(notificationId);
    state.pinned = !state.pinned;
    this.setNotificationState(notificationId, state);
    return state.pinned;
  }

  // Archive state
  isArchived(notificationId: string): boolean {
    return this.getNotificationState(notificationId).archived;
  }

  toggleArchive(notificationId: string): boolean {
    const state = this.getNotificationState(notificationId);
    state.archived = !state.archived;
    this.setNotificationState(notificationId, state);
    return state.archived;
  }

  // Reactions
  getReactions(notificationId: string): NotificationReaction {
    return this.getNotificationState(notificationId).reactions;
  }

  toggleReaction(notificationId: string, reactionType: 'like' | 'dislike'): NotificationReaction {
    const state = this.getNotificationState(notificationId);
    const { reactions } = state;

    if (reactionType === 'like') {
      if (reactions.userReaction === 'like') {
        // Remove like
        reactions.likes = Math.max(0, reactions.likes - 1);
        reactions.userReaction = null;
      } else {
        // Add like, remove dislike if exists
        if (reactions.userReaction === 'dislike') {
          reactions.dislikes = Math.max(0, reactions.dislikes - 1);
        }
        reactions.likes += 1;
        reactions.userReaction = 'like';
      }
    } else {
      if (reactions.userReaction === 'dislike') {
        // Remove dislike
        reactions.dislikes = Math.max(0, reactions.dislikes - 1);
        reactions.userReaction = null;
      } else {
        // Add dislike, remove like if exists
        if (reactions.userReaction === 'like') {
          reactions.likes = Math.max(0, reactions.likes - 1);
        }
        reactions.dislikes += 1;
        reactions.userReaction = 'dislike';
      }
    }

    this.setNotificationState(notificationId, state);
    return reactions;
  }

  // Comments
  getComments(notificationId: string): NotificationComment[] {
    return this.getNotificationState(notificationId).comments;
  }

  addComment(notificationId: string, comment: Omit<NotificationComment, 'id' | 'timestamp'>): NotificationComment {
    const state = this.getNotificationState(notificationId);
    const newComment: NotificationComment = {
      ...comment,
      id: `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };
    state.comments.push(newComment);
    this.setNotificationState(notificationId, state);
    return newComment;
  }

  deleteComment(notificationId: string, commentId: string): void {
    const state = this.getNotificationState(notificationId);
    state.comments = state.comments.filter(c => c.id !== commentId);
    this.setNotificationState(notificationId, state);
  }

  // Bulk operations
  bulkMarkAsRead(notificationIds: string[]): void {
    this.markAllAsRead(notificationIds);
  }

  bulkArchive(notificationIds: string[]): void {
    const allData = this.getData();
    notificationIds.forEach(id => {
      const state = allData[id] || {
        read: false,
        pinned: false,
        archived: false,
        reactions: { likes: 0, dislikes: 0, userReaction: null },
        comments: [],
      };
      state.archived = true;
      allData[id] = state;
    });
    this.saveData(allData);
  }

  bulkDelete(notificationIds: string[]): void {
    const allData = this.getData();
    notificationIds.forEach(id => {
      delete allData[id];
    });
    this.saveData(allData);
  }

  // Clear all data (useful for testing)
  clearAllData(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }
}

const notificationsService = new NotificationsService();
export default notificationsService;
