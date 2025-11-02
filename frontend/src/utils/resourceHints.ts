/**
 * Resource Hints Manager
 * Implements prefetch, preload, preconnect, and prefetch-dns directives
 * Improves loading performance and perceived speed
 */

type ResourceHintType = 'prefetch' | 'preload' | 'preconnect' | 'dns-prefetch' | 'prerender';

interface ResourceHintConfig {
  href: string;
  type?: ResourceHintType;
  as?: string;
  crossorigin?: 'anonymous' | 'use-credentials';
}

/**
 * Add resource hint to document head
 */
export const addResourceHint = (config: ResourceHintConfig): HTMLLinkElement | null => {
  try {
    const link = document.createElement('link');
    link.rel = config.type || 'prefetch';
    link.href = config.href;

    if (config.as) {
      link.as = config.as;
    }

    if (config.crossorigin) {
      link.crossOrigin = config.crossorigin;
    }

    document.head.appendChild(link);

    if (import.meta.env.DEV) {
      console.log(`✅ Added ${config.type} hint for: ${config.href}`);
    }

    return link;
  } catch (error) {
    console.error('Failed to add resource hint:', error);
    return null;
  }
};

/**
 * Prefetch a resource
 * Useful for resources that might be needed soon
 */
export const prefetch = (href: string): void => {
  addResourceHint({ href, type: 'prefetch' });
};

/**
 * Preload a resource
 * Forces immediate loading, use for critical resources
 */
export const preload = (href: string, as: string): void => {
  addResourceHint({ href, type: 'preload', as });
};

/**
 * Preconnect to origin
 * Establishes early connection to cross-origin domain
 */
export const preconnect = (origin: string, crossorigin: boolean = true): void => {
  addResourceHint({
    href: origin,
    type: 'preconnect',
    crossorigin: crossorigin ? 'anonymous' : undefined,
  });
};

/**
 * DNS prefetch
 * Resolves DNS early for cross-origin resources
 */
export const dnsPrefetch = (origin: string): void => {
  addResourceHint({ href: origin, type: 'dns-prefetch' });
};

/**
 * Prerender a page
 * Use sparingly - speculatively loads entire page
 */
export const prerender = (url: string): void => {
  addResourceHint({ href: url, type: 'prerender' });
};

/**
 * Configure common resource hints for external services
 */
export const configureResourceHints = (): void => {
  // Common CDNs and services
  const hints: ResourceHintConfig[] = [
    // Google services
    { href: 'https://fonts.googleapis.com', type: 'preconnect', crossorigin: 'anonymous' },
    { href: 'https://fonts.gstatic.com', type: 'preconnect', crossorigin: 'anonymous' },

    // Analytics (if needed)
    // { href: 'https://www.google-analytics.com', type: 'dns-prefetch' },

    // Local important resources
    // Uncomment if you have important API endpoints
    // { href: 'https://your-api.com', type: 'preconnect', crossorigin: 'anonymous' },
  ];

  hints.forEach((hint) => addResourceHint(hint));

  if (import.meta.env.DEV) {
    console.log(`✅ Configured ${hints.length} resource hints`);
  }
};

/**
 * Lazy preload resources when visible (intersection observer)
 */
export const lazyPreload = (
  selector: string,
  resourceGetter: (element: Element) => string | null
): void => {
  if (!('IntersectionObserver' in window)) {
    console.warn('IntersectionObserver not supported');
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const resource = resourceGetter(entry.target);
        if (resource) {
          prefetch(resource);
          observer.unobserve(entry.target);
        }
      }
    });
  });

  document.querySelectorAll(selector).forEach((el) => observer.observe(el));
};

export default {
  addResourceHint,
  prefetch,
  preload,
  preconnect,
  dnsPrefetch,
  prerender,
  configureResourceHints,
  lazyPreload,
};
