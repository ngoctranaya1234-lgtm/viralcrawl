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

export function createAccessibleDialog({ id, title, content, onClose }) {
  const previousActive = document.activeElement;
  const overlay = element('div', {
    id,
    class: 'fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4',
    role: 'dialog',
    'aria-modal': 'true',
    'aria-labelledby': `${id}-title`
  });

  const dialogBox = element('div', {
    class: 'bg-slate-900 border border-slate-800 rounded-2xl p-5 max-w-md w-full shadow-2xl relative',
    tabindex: '-1'
  });

  const titleEl = element('h3', { id: `${id}-title`, class: 'text-base font-bold text-white mb-2' }, [title]);
  const closeBtn = element('button', {
    class: 'absolute top-3 right-3 text-slate-400 hover:text-white p-1 rounded-lg',
    'aria-label': 'Đóng',
    onClick: close
  }, ['✕']);

  dialogBox.appendChild(titleEl);
  dialogBox.appendChild(closeBtn);
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
