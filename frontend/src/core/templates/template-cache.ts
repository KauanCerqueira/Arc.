import type { Template, TemplateCacheConfig, RenderedTemplate } from './schema';

/**
 * Sistema de cache LRU (Least Recently Used) para templates
 *
 * Armazena templates em memória para melhorar performance,
 * com controle de tamanho e estratégia de expiração
 */

const DEFAULT_CONFIG: TemplateCacheConfig = {
  ttl: 60 * 5, // 5 minutes
  maxSize: 20, // 20 templates
  strategy: 'lru',
};

class TemplateCache {
  private cache: Map<string, RenderedTemplate>;
  private accessOrder: string[];
  private config: TemplateCacheConfig;

  constructor(config: Partial<TemplateCacheConfig> = {}) {
    this.cache = new Map();
    this.accessOrder = [];
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Adiciona ou atualiza um template no cache
   */
  set(templateId: string, template: Template, state?: Map<string, any>): void {
    // Remove o template antigo se existir
    if (this.cache.has(templateId)) {
      this.accessOrder = this.accessOrder.filter((id) => id !== templateId);
    }

    // Verifica se o cache está cheio
    if (this.cache.size >= this.config.maxSize) {
      this.evict();
    }

    // Adiciona o novo template
    const rendered: RenderedTemplate = {
      template,
      state: state || new Map(),
      services: new Map(),
      hooks: new Map(),
      cachedAt: Date.now(),
    };

    this.cache.set(templateId, rendered);
    this.accessOrder.push(templateId);
  }

  /**
   * Busca um template no cache
   */
  get(templateId: string): RenderedTemplate | null {
    const item = this.cache.get(templateId);

    if (!item) {
      return null;
    }

    // Verifica se o item expirou
    const age = (Date.now() - item.cachedAt) / 1000;
    if (age > this.config.ttl) {
      this.cache.delete(templateId);
      this.accessOrder = this.accessOrder.filter((id) => id !== templateId);
      return null;
    }

    // Atualiza a ordem de acesso (LRU)
    if (this.config.strategy === 'lru') {
      this.accessOrder = this.accessOrder.filter((id) => id !== templateId);
      this.accessOrder.push(templateId);
    }

    return item;
  }

  /**
   * Remove um template do cache
   */
  delete(templateId: string): boolean {
    this.accessOrder = this.accessOrder.filter((id) => id !== templateId);
    return this.cache.delete(templateId);
  }

  /**
   * Limpa o cache completamente
   */
  clear(): void {
    this.cache.clear();
    this.accessOrder = [];
  }

  /**
   * Remove o template menos recentemente usado
   */
  private evict(): void {
    if (this.accessOrder.length === 0) {
      return;
    }

    const lruId = this.accessOrder[0];
    this.cache.delete(lruId);
    this.accessOrder.shift();
  }

  /**
   * Retorna estatísticas do cache
   */
  stats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    entries: string[];
  } {
    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      hitRate: 0, // TODO: Implementar tracking de hits/misses
      entries: Array.from(this.cache.keys()),
    };
  }

  /**
   * Remove templates expirados
   */
  cleanup(): number {
    let removed = 0;
    const now = Date.now();

    for (const [id, item] of this.cache.entries()) {
      const age = (now - item.cachedAt) / 1000;
      if (age > this.config.ttl) {
        this.cache.delete(id);
        this.accessOrder = this.accessOrder.filter((orderId) => orderId !== id);
        removed++;
      }
    }

    return removed;
  }
}

// Singleton instance
let cacheInstance: TemplateCache | null = null;

/**
 * Obtém a instância singleton do cache
 */
export function getTemplateCache(config?: Partial<TemplateCacheConfig>): TemplateCache {
  if (!cacheInstance) {
    cacheInstance = new TemplateCache(config);
  }
  return cacheInstance;
}

/**
 * Hook React para usar o cache de templates
 */
export function useTemplateCache() {
  const cache = getTemplateCache();

  return {
    get: cache.get.bind(cache),
    set: cache.set.bind(cache),
    delete: cache.delete.bind(cache),
    clear: cache.clear.bind(cache),
    stats: cache.stats.bind(cache),
  };
}

/**
 * Inicializa limpeza automática do cache
 * Executa a cada 5 minutos
 */
if (typeof window !== 'undefined') {
  setInterval(() => {
    const cache = getTemplateCache();
    const removed = cache.cleanup();
    if (removed > 0) {
      console.log(`[TemplateCache] Cleaned up ${removed} expired templates`);
    }
  }, 5 * 60 * 1000); // 5 minutes
}
