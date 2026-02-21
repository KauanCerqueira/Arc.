// Normaliza NEXT_PUBLIC_API_URL para evitar //, barras finais e duplicação de /api
const RAW = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Remove barras finais
const stripTrailingSlash = (s: string) => s.replace(/\/+$/g, '');

// Remove eventual "/api" final
const stripApiSuffix = (s: string) => s.replace(/\/api$/i, '');

export const API_HOST = stripApiSuffix(stripTrailingSlash(RAW));

// Base com /api (ex: https://api.example.com/api)
export const API_BASE = `${API_HOST}/api`;

// Hubs URL (SignalR)
export const API_HUBS = `${API_BASE}/hubs`;

export default {
  RAW,
  API_HOST,
  API_BASE,
  API_HUBS,
};
