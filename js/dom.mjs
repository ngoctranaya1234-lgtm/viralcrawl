// js/dom.mjs — Secure DOM construction & accessible dialog helpers
// Follows OWASP strict encoding: no innerHTML injection for untrusted data

export function text(value) {
  return document.createTextNode(value != null ? String(value) : '');
}

export function element(tag, attrs = {}, children = []) {
  const el = document.createElement(tag);

  for (const [key, value] of Object.entries(attrs)) {
    if (value == null || value === false) continue;

    if (key.startsWith('on') && typeof value === 'function') {
      const eventName = key.slice(2).toLowerCase();
      el.addEventListener(eventName, value);
    } else if (key === 'className' || key === 'class') {
      el.className = String(value);
    } else if (key === 'dataset' && typeof value === 'object') {
      for (const [dKey, dVal] of Object.entries(value)) {
        if (dVal != null) el.dataset[dKey] = String(dVal);
      }
    } else if (key === 'style' && typeof value === 'object') {
      Object.assign(el.style, value);
    } else {
      el.setAttribute(key, value === true ? '' : String(value));
    }
  }

  const childList = Array.isArray(children) ? children : [children];
  for (const child of childList) {
    if (child == null || child === false) continue;
    if (typeof child === 'string' || typeof child === 'number') {
      el.appendChild(document.createTextNode(String(child)));
    } else if (child instanceof Node) {
      el.appendChild(child);
    }
  }

  return el;
}

export function trapFocus(containerEl) {
  const focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      const focusables = Array.from(containerEl.querySelectorAll(focusableSelector)).filter(el => !el.disabled);
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        last.focus();
        e.preventDefault();
      } else if (!e.shiftKey && document.activeElement === last) {
        first.focus();
        e.preventDefault();
      }
    }
  };

  containerEl.addEventListener('keydown', handleKeyDown);
  return () => containerEl.removeEventListener('keydown', handleKeyDown);
}

export function playSound(type = 'click') {
  try {
    if (typeof window === 'undefined') return;
    if (window.localStorage?.getItem('vc_mute') === 'true') return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'success') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.15); // G5
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } else if (type === 'download') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(330, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.18);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
      osc.start();
      osc.stop(ctx.currentTime + 0.22);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    }
  } catch {
    // AudioContext blocked or unsupported
  }
}

export function showToast({ type = 'info', title = '', message = '' } = {}) {
  if (typeof document === 'undefined') return;
  let toastContainer = document.getElementById('app-toasts');
  if (!toastContainer) {
    toastContainer = element('div', {
      id: 'app-toasts',
      class: 'fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none'
    });
    document.body.appendChild(toastContainer);
  }

  const icons = {
    success: '✓',
    error: '✕',
    warning: '!',
    info: 'ℹ'
  };

  const colors = {
    success: 'border-emerald-500 text-emerald-400',
    error: 'border-red-500 text-red-400',
    warning: 'border-amber-500 text-amber-400',
    info: 'border-cyan-500 text-cyan-400'
  };

  const toast = element('div', {
    class: `p-3.5 rounded-xl bg-slate-900 border ${colors[type] || colors.info} shadow-2xl flex items-start gap-3 pointer-events-auto transition-all transform duration-300`,
    style: 'min-width: 280px; max-width: 400px; transform: translateX(100%); opacity: 0;'
  }, [
    element('div', {
      style: 'width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0; background: rgba(255,255,255,0.06);',
      class: colors[type] || colors.info
    }, [icons[type] || '•']),
    element('div', { class: 'flex-1 min-w-0' }, [
      title ? element('div', { class: 'text-xs font-bold text-white mb-0.5' }, [title]) : null,
      element('div', { class: 'text-xs text-slate-300 leading-relaxed' }, [message || ''])
    ])
  ]);

  toastContainer.appendChild(toast);
  requestAnimationFrame(() => {
    toast.style.transform = 'translateX(0)';
    toast.style.opacity = '1';
  });

  setTimeout(() => {
    toast.style.transform = 'translateX(100%)';
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

export function createAccessibleDialog({ id, title, content, onClose }) {
  const previousActive = document.activeElement;
  const overlay = element('div', {
    id,
    class: 'fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4',
    style: 'position: fixed; inset: 0; background: rgba(0,0,0,0.75); display: flex; align-items: center; justify-content: center; z-index: 9999;',
    role: 'dialog',
    'aria-modal': 'true',
    'aria-labelledby': `${id}-title`
  });

  const dialogBox = element('div', {
    class: 'modal bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl relative',
    style: 'max-width: 460px; width: 100%; box-shadow: 0 20px 50px rgba(0,0,0,0.6);',
    tabindex: '-1'
  });

  const headerRow = element('div', {
    class: 'modal-header flex items-center justify-between pb-3 mb-4 border-b border-slate-800 gap-3'
  }, [
    element('h3', { id: `${id}-title`, class: 'modal-title text-base font-bold text-white min-w-0 truncate' }, [title]),
    element('button', {
      type: 'button',
      class: 'btn-ghost p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex items-center justify-center',
      style: 'width: 32px; height: 32px; flex-shrink: 0; cursor: pointer; border: none; background: transparent;',
      'aria-label': 'Đóng',
      onClick: close
    }, ['✕'])
  ]);

  dialogBox.appendChild(headerRow);
  if (content instanceof Node) {
    dialogBox.appendChild(content);
  } else if (typeof content === 'string') {
    dialogBox.appendChild(element('p', { class: 'text-xs text-slate-300' }, [content]));
  }

  overlay.appendChild(dialogBox);

  let cleanFocusTrap = null;

  function close() {
    if (cleanFocusTrap) cleanFocusTrap();
    window.removeEventListener('keydown', handleGlobalKey);
    overlay.remove();
    if (previousActive && typeof previousActive.focus === 'function') {
      previousActive.focus();
    }
    if (typeof onClose === 'function') onClose();
  }

  function handleGlobalKey(e) {
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
    }
  }

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });

  window.addEventListener('keydown', handleGlobalKey);
  document.body.appendChild(overlay);
  cleanFocusTrap = trapFocus(overlay);
  dialogBox.focus();

  return { close, element: overlay };
}
