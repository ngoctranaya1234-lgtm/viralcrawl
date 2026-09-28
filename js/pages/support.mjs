// js/pages/support.mjs — Honest support page with direct Gmail compose flow
import { element, playSound, showToast } from '../dom.mjs';

export async function openGmailCompose({
  api = null,
  desktopOpen = null,
  windowRef = (typeof window !== 'undefined' ? window : null),
  fields = {},
  supportEmail = 'support@2tech.mn'
} = {}) {
  const sanitize = (val) => String(val || '').replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim();
  const subject = sanitize(fields.subject);
  const contact = sanitize(fields.contact) || 'Ẩn danh';
  const message = sanitize(fields.message);

  if (!subject) throw new Error('Tiêu đề không được để trống.');
  if (!message) throw new Error('Nội dung không được để trống.');

  const bodyText = `Người liên hệ: ${contact}\n\nNội dung:\n${message}\n\n---\nỨng dụng: Mnhut 2tech Al 4K Studio (2TECH MN - Nguyễn Minh Nhựt)`;
  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(supportEmail)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`;

  if (typeof desktopOpen === 'function') {
    try {
      const res = await desktopOpen(gmailUrl);
      if (res && (res.ok || res.status === 200)) return 'opened';
    } catch (_) {}
  } else if (api && typeof api.desktopOpen === 'function') {
    try {
      const res = await api.desktopOpen(gmailUrl);
      if (res && (res.ok || res.status === 200)) return 'opened';
    } catch (_) {}
  }

  if (windowRef && typeof windowRef.open === 'function') {
    try {
      const pop = windowRef.open(gmailUrl, '_blank');
      if (pop) {
        return 'opened';
      }
    } catch (_) {}
  }

  if (windowRef && windowRef.location) {
    windowRef.location.href = gmailUrl;
    return 'same-tab';
  }

  return 'same-tab';
}

export function createSupportPage({ state, api } = {}) {
  let container = null;

  function render(outlet) {
    outlet.innerHTML = '';
    container = element('div', { class: 'max-w-2xl mx-auto p-4 sm:p-6 flex flex-col gap-5' });

    const header = element('div', { class: 'flex flex-col gap-1' }, [
      element('h2', { class: 'text-lg font-bold text-white flex items-center gap-2' }, ['💬 Trung Tâm Hỗ Trợ & Góp Ý']),
      element('p', { class: 'text-xs text-slate-400' }, [
        'Kỹ sư trưởng Nguyễn Minh Nhựt • Đơn vị 2TECH MN. Tin nhắn của bạn sẽ được chuyển thẳng tới Gmail hỗ trợ chính thức.'
      ])
    ]);
    container.appendChild(header);

    const formBox = element('div', { class: 'p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-4 shadow-xl' });

    const contactInput = element('input', {
      type: 'text',
      placeholder: 'Email hoặc số điện thoại của bạn',
      class: 'w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500'
    });

    const subjectInput = element('input', {
      type: 'text',
      placeholder: 'Chủ đề (VD: Báo lỗi tải video, đề xuất tính năng)',
      class: 'w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500'
    });

    const messageInput = element('textarea', {
      rows: '5',
      placeholder: 'Mô tả chi tiết thắc mắc hoặc lỗi bạn gặp phải...',
      class: 'w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500'
    });

    const notice = element('p', { class: 'text-[11px] text-slate-400 leading-relaxed' }, [
      'ℹ️ Bấm nút gửi bên dưới sẽ mở màn hình soạn thảo Gmail với người nhận là ',
      element('strong', { class: 'text-emerald-400' }, ['support@2tech.mn']),
      '. Hệ thống cam kết không lưu trữ hay rò rỉ dữ liệu cá nhân của bạn.'
    ]);

    const sendBtn = element('button', {
      type: 'button',
      class: 'py-2.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all self-start flex items-center gap-2 shadow-lg shadow-emerald-900/30',
      onClick: async () => {
        const contact = contactInput.value.trim();
        const subject = subjectInput.value.trim();
        const message = messageInput.value.trim();

        if (!subject || !message) {
          playSound('click');
          showToast({
            type: 'warning',
            title: 'Thiếu thông tin',
            message: 'Vui lòng nhập chủ đề và nội dung cần hỗ trợ.'
          });
          return;
        }

        await openGmailCompose({
          fields: { contact, subject, message }
        });
      }
    }, ['Mở Gmail Soạn Thư Gửi 2TECH']);

    formBox.appendChild(contactInput);
    formBox.appendChild(subjectInput);
    formBox.appendChild(messageInput);
    formBox.appendChild(notice);
    formBox.appendChild(sendBtn);
    container.appendChild(formBox);

    outlet.appendChild(container);
  }

  return {
    mount(outlet) {
      render(outlet);
    },
    unmount() {
      if (container) {
        container.remove();
        container = null;
      }
    }
  };
}
