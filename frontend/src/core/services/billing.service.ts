export type PaymentMethod = {
  id: string;
  brand: string; // visa, mastercard, amex, etc
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault?: boolean;
};

const STORAGE_KEY = 'billing_payment_methods';

function readLocal(): PaymentMethod[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as PaymentMethod[];
  } catch {}
  return [];
}

function writeLocal(list: PaymentMethod[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch {}
}

async function safeFetch<T>(path: string, init?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(path, init);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

const billingService = {
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    const api = await safeFetch<PaymentMethod[]>('/api/billing/payment-methods');
    if (api) return api;
    return readLocal();
  },

  async addPaymentMethod(method: Omit<PaymentMethod, 'id' | 'isDefault'>): Promise<PaymentMethod[]> {
    const api = await safeFetch<PaymentMethod[]>('/api/billing/payment-methods', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(method),
    });
    if (api) return api;

    // fallback local
    const list = readLocal();
    const id = String(Date.now());
    const newItem: PaymentMethod = { id, ...method, isDefault: list.length === 0 } as PaymentMethod;
    const updated = [...list, newItem];
    writeLocal(updated);
    return updated;
  },

  async deletePaymentMethod(id: string): Promise<PaymentMethod[]> {
    const api = await safeFetch<PaymentMethod[]>(`/api/billing/payment-methods/${id}`, { method: 'DELETE' });
    if (api) return api;

    const list = readLocal().filter((m) => m.id !== id);
    // ensure one default
    if (!list.some((m) => m.isDefault) && list.length > 0) list[0].isDefault = true;
    writeLocal(list);
    return list;
  },

  async setDefaultPaymentMethod(id: string): Promise<PaymentMethod[]> {
    const api = await safeFetch<PaymentMethod[]>(`/api/billing/payment-methods/${id}/default`, { method: 'POST' });
    if (api) return api;

    const list = readLocal().map((m) => ({ ...m, isDefault: m.id === id }));
    writeLocal(list);
    return list;
  },
};

export default billingService;

