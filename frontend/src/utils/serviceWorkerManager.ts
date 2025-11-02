/**
 * Service Worker Registration and Lifecycle Management
 * Enables offline support, caching strategies, and PWA capabilities
 */

interface ServiceWorkerConfig {
  scope?: string;
  enabled?: boolean;
  updateCheckInterval?: number;
}

class ServiceWorkerManager {
  private registration: ServiceWorkerRegistration | null = null;
  private config: ServiceWorkerConfig;

  constructor(config: ServiceWorkerConfig = {}) {
    this.config = {
      scope: '/',
      enabled: import.meta.env.PROD,
      updateCheckInterval: 60000, // Check for updates every minute
      ...config,
    };
  }

  /**
   * Register the Service Worker
   */
  async register(): Promise<ServiceWorkerRegistration | null> {
    if (!this.config.enabled || !('serviceWorker' in navigator)) {
      console.info('Service Worker not available or disabled');
      return null;
    }

    try {
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: this.config.scope,
      });

      console.log('✅ Service Worker registered successfully');

      // Check for updates periodically
      this.startUpdateCheck();

      // Listen for new versions
      this.listenForUpdates();

      return this.registration;
    } catch (error) {
      console.error('❌ Service Worker registration failed:', error);
      return null;
    }
  }

  /**
   * Unregister the Service Worker
   */
  async unregister(): Promise<boolean> {
    if (!this.registration) {
      return false;
    }

    try {
      const success = await this.registration.unregister();
      if (success) {
        console.log('✅ Service Worker unregistered');
        this.registration = null;
      }
      return success;
    } catch (error) {
      console.error('❌ Failed to unregister Service Worker:', error);
      return false;
    }
  }

  /**
   * Check for updates and reload if available
   */
  private startUpdateCheck(): void {
    if (!this.registration) return;

    setInterval(() => {
      this.registration?.update();
    }, this.config.updateCheckInterval);
  }

  /**
   * Listen for Service Worker updates
   */
  private listenForUpdates(): void {
    if (!this.registration) return;

    this.registration.addEventListener('updatefound', () => {
      const newWorker = this.registration?.installing;

      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (
            newWorker.state === 'installed' &&
            navigator.serviceWorker.controller
          ) {
            // New Service Worker is ready
            console.log('🔄 New Service Worker version available');
            this.notifyUpdate();
          }
        });
      }
    });
  }

  /**
   * Notify user about available update
   */
  private notifyUpdate(): void {
    if (confirm('🔄 New version available! Reload to update?')) {
      window.location.reload();
    }
  }

  /**
   * Get current registration
   */
  getRegistration(): ServiceWorkerRegistration | null {
    return this.registration;
  }

  /**
   * Send message to Service Worker
   */
  postMessage(message: any): void {
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage(message);
    }
  }
}

// Export singleton instance
export const swManager = new ServiceWorkerManager();

// Auto-register on module load (can be disabled)
export const initServiceWorker = async (config?: ServiceWorkerConfig) => {
  if (config) {
    const manager = new ServiceWorkerManager(config);
    return manager.register();
  }
  return swManager.register();
};

export default ServiceWorkerManager;
