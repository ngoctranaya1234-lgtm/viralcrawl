// js/router.mjs — Secure client-side routing with clean unmount & abortable async tasks

export function createRouter({
  outlet,
  routes = {},
  defaultRoute = 'dashboard'
} = {}) {
  let currentRoute = null;
  let currentUnmount = null;
  let currentAbortController = null;

  async function navigate(targetRoute, params = {}) {
    let routeName = targetRoute;
    if (!routeName || !routes[routeName]) {
      routeName = defaultRoute;
    }

    if (currentRoute === routeName && currentUnmount) {
      // Already on route
      return;
    }

    // Abort prior async operations
    if (currentAbortController) {
      try {
        currentAbortController.abort();
      } catch (_) {}
    }
    currentAbortController = new AbortController();

    // Clean up previous route
    if (typeof currentUnmount === 'function') {
      try {
        currentUnmount();
      } catch (err) {
        console.error('[Router unmount error]', err);
      }
      currentUnmount = null;
    }

    if (outlet) {
      outlet.innerHTML = '';
    }

    currentRoute = routeName;
    const routeHandler = routes[routeName];

    if (typeof routeHandler === 'function') {
      try {
        const cleanup = await routeHandler({
          outlet,
          params,
          signal: currentAbortController.signal,
          navigate
        });
        if (typeof cleanup === 'function') {
          currentUnmount = cleanup;
        }
      } catch (err) {
        console.error(`[Router mount error for ${routeName}]`, err);
      }
    }

    // Update active state on navigation elements if present
    document.querySelectorAll('[data-route]').forEach(el => {
      const isMatch = el.getAttribute('data-route') === routeName;
      el.classList.toggle('active', isMatch);
      el.setAttribute('aria-current', isMatch ? 'page' : 'false');
    });
  }

  function handleHashChange() {
    const rawHash = window.location.hash.replace(/^#\/?/, '').trim();
    const routeName = rawHash || defaultRoute;
    navigate(routeName);
  }

  function start() {
    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();
  }

  function stop() {
    window.removeEventListener('hashchange', handleHashChange);
    if (typeof currentUnmount === 'function') {
      currentUnmount();
      currentUnmount = null;
    }
    if (currentAbortController) {
      currentAbortController.abort();
    }
  }

  return {
    navigate,
    getCurrentRoute: () => currentRoute,
    start,
    stop
  };
}
