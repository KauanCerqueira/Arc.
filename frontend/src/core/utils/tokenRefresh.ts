/**
 * Auto Token Refresh System
 * Automatically refreshes JWT token before it expires
 */

import authService from '../services/auth.service';

let refreshTimer: NodeJS.Timeout | null = null;

/**
 * Decode JWT token to get expiration time
 */
function decodeToken(token: string): { exp: number } | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
}

/**
 * Calculate time until token expires (in milliseconds)
 */
function getTimeUntilExpiry(token: string): number {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return 0;

  const now = Date.now();
  const expiry = decoded.exp * 1000; // Convert to milliseconds
  const timeUntilExpiry = expiry - now;

  return timeUntilExpiry;
}

/**
 * Schedule token refresh before it expires
 * Refreshes 5 minutes before expiration
 */
export function scheduleTokenRefresh(): void {
  // Clear existing timer
  if (refreshTimer) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }

  const token = authService.getToken();
  if (!token) return;

  const timeUntilExpiry = getTimeUntilExpiry(token);

  // Se o token já expirou ou vai expirar em menos de 1 minuto, refresh agora
  if (timeUntilExpiry <= 60000) {
    console.log('🔄 Token expiring soon, refreshing now...');
    performTokenRefresh();
    return;
  }

  // Agendar refresh para 5 minutos antes da expiração (ou metade do tempo, o que for menor)
  const refreshTime = Math.min(timeUntilExpiry - 5 * 60 * 1000, timeUntilExpiry / 2);

  console.log(`⏰ Token refresh scheduled in ${Math.round(refreshTime / 1000 / 60)} minutes`);

  refreshTimer = setTimeout(() => {
    performTokenRefresh();
  }, refreshTime);
}

/**
 * Perform token refresh
 */
async function performTokenRefresh(): Promise<void> {
  try {
    console.log('🔄 Refreshing token...');
    const response = await authService.refreshToken();

    console.log('✅ Token refreshed successfully');

    // Agendar próximo refresh
    scheduleTokenRefresh();
  } catch (error) {
    console.error('❌ Failed to refresh token:', error);

    // Se falhar, tentar novamente em 1 minuto
    refreshTimer = setTimeout(() => {
      performTokenRefresh();
    }, 60000);
  }
}

/**
 * Stop token refresh scheduler
 */
export function stopTokenRefresh(): void {
  if (refreshTimer) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token: string): boolean {
  const timeUntilExpiry = getTimeUntilExpiry(token);
  return timeUntilExpiry <= 0;
}
