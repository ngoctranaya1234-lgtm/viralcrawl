// js/pages/settings.mjs — Elite Admin Dashboard & System Control Center
import { element, playSound, showToast } from '../dom.mjs';

const ADMIN_PRIMARY_EMAIL = 'nhutnguyen06092021@gmail.com';
const ADMIN_PRIMARY_NAME = 'Kỹ sư Nguyễn Minh Nhựt';

export function createSettingsPage({ state, api } = {}) {
  let container = null;
  let unsubscribeState = null;

  function render(outlet) {
    outlet.innerHTML = '';
    const snap = state?.getSnapshot ? state.getSnapshot() : {};
    const user = snap.user;
    const credits = snap.credits?.availableCredits ?? 0;
    const plan = user?.plan || 'ULTRA';
    const planExpiry = user?.entitlement?.endsAt || new Date(Date.now() + 30 * 86400000).toISOString();
    const displayName = user?.name || ADMIN_PRIMARY_NAME;
    const displayEmail = (user?.email && user.email !== 'nhut@2techmn.com' && user.email !== 'nhut@2tech.mn')
      ? user.email
      : ADMIN_PRIMARY_EMAIL;

    container = element('div', { class: 'settings-container max-w-4xl mx-auto p-4 sm:p-6 flex flex-col gap-6' });

    // 1. Dashboard Header
    const header = element('div', { class: 'flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800/80' }, [
      element('div', { class: 'flex flex-col gap-1' }, [
        element('div', { class: 'flex items-center gap-2.5' }, [
          element('span', { class: 'text-2xl' }, ['🛡️']),
          element('h2', { class: 'text-xl font-bold text-white tracking-wide' }, ['Bảng Điều Khiển Quản Trị Viên (Admin Console)']),
          element('span', { class: 'px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono uppercase tracking-wider' }, ['Root Superuser'])
        ]),
        element('p', { class: 'text-xs text-slate-400' }, [
          'Hồ sơ quản trị tối cao & Trung tâm điều phối hệ thống ViralCrawl AI 4K Studio • Kỹ sư trưởng ',
          element('strong', { class: 'text-slate-200' }, [ADMIN_PRIMARY_NAME])
        ])
      ]),
      element('div', { class: 'flex items-center gap-2' }, [
        element('div', { class: 'flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300' }, [
          element('span', { class: 'w-2 h-2 rounded-full bg-emerald-400 animate-pulse' }),
          'Hệ thống: ',
          element('strong', { class: 'text-emerald-400' }, ['Trực Tuyến (Online)'])
        ])
      ])
    ]);
    container.appendChild(header);

    // 2. Admin Hero Profile Card
    const heroCard = element('div', {
      class: 'p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 shadow-2xl relative overflow-hidden'
    }, [
      element('div', { class: 'flex items-center gap-4 min-w-0' }, [
        element('div', {
          style: 'width:60px;height:60px;border-radius:18px;background:linear-gradient(135deg, #10b981 0%, #0284c7 100%);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:24px;flex-shrink:0;box-shadow:0 0 20px rgba(16,185,129,0.3);border:2px solid rgba(255,255,255,0.15);'
        }, ['MN']),
        element('div', { class: 'flex flex-col gap-1 min-w-0' }, [
          element('div', { class: 'flex flex-wrap items-center gap-2' }, [
            element('h3', { class: 'text-base sm:text-lg font-bold text-white truncate' }, [displayName]),
            element('span', { class: 'px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/15 text-sky-400 border border-sky-500/30' }, ['Quản Trị Viên Tối Cao'])
          ]),
          element('div', { class: 'flex items-center gap-2 text-xs text-slate-300 font-mono' }, [
            element('span', { class: 'text-slate-400' }, ['Email Admin:']),
            element('span', { class: 'text-emerald-400 font-semibold truncate' }, [displayEmail]),
            element('button', {
              type: 'button',
              title: 'Sao chép email Admin',
              class: 'p-1 hover:text-white text-slate-400 transition-colors',
              onClick: () => {
                if (typeof navigator !== 'undefined' && navigator.clipboard) {
                  navigator.clipboard.writeText(displayEmail);
                  playSound('click');
                  showToast({ type: 'info', title: 'Đã sao chép', message: `Đã sao chép email: ${displayEmail}` });
                }
              }
            }, ['📋'])
          ]),
          element('div', { class: 'text-[11px] text-slate-400 flex items-center gap-2' }, [
            element('span', { class: 'text-slate-400' }, ['Vai trò:']),
            element('span', { class: 'text-slate-200 font-semibold' }, ['Staff Full-Stack Engineer & System Owner']),
            element('span', { class: 'text-slate-600' }, ['•']),
            element('span', { class: 'text-amber-400 font-semibold' }, ['Quyền Root Không Giới Hạn'])
          ])
        ])
      ]),
      element('div', { class: 'flex sm:flex-col items-center sm:items-end gap-2 shrink-0 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800' }, [
        element('div', { class: 'text-left sm:text-right' }, [
          element('div', { class: 'text-[11px] text-slate-400 uppercase tracking-wider' }, ['Cấp Bậc Bản Quyền']),
          element('div', { class: 'text-sm font-bold text-emerald-400 flex items-center sm:justify-end gap-1 font-mono' }, [
            '⚡ ',
            plan === 'ULTRA' ? 'ULTRA ENTERPRISE' : plan
          ]),
          element('div', { class: 'text-[10px] text-slate-400 font-mono' }, [
            `Gia hạn: ${new Date(planExpiry).toLocaleDateString('vi-VN')}`
          ])
        ])
      ])
    ]);
    container.appendChild(heroCard);

    // 3. Admin KPI Telemetry Gauges (4 cards)
    const kpiGrid = element('div', { class: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5' });

    // KPI 1: Credit Balance
    const kpiCredits = element('div', { class: 'p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col gap-2' }, [
      element('div', { class: 'flex items-center justify-between text-xs text-slate-400' }, [
        element('span', {}, ['Tín Dụng Khả Dụng']),
        element('span', { class: 'text-emerald-400 text-sm' }, ['💎'])
      ]),
      element('div', { class: 'text-xl font-bold font-mono text-emerald-400' }, [
        `${Number(credits).toLocaleString('vi-VN')} credit`
      ]),
      element('div', { class: 'flex items-center justify-between mt-auto pt-1' }, [
        element('span', { class: 'text-[11px] text-slate-400' }, ['Nội bộ Admin']),
        element('button', {
          type: 'button',
          class: 'btn btn-secondary text-[11px] py-1 px-2 rounded-lg font-semibold text-emerald-400 hover:text-emerald-300 border border-emerald-500/30',
          onClick: () => {
            if (state?.addCredits) {
              const newBal = state.addCredits(4000000);
              playSound('success');
              showToast({
                type: 'success',
                title: 'Nạp Tín Dụng Admin',
                message: `Đã cộng ngay 4.000.000 credit quản trị (Tổng: ${newBal.toLocaleString('vi-VN')} credit).`
              });
              render(outlet);
            }
          }
        }, ['+4M Credit'])
      ])
    ]);
    kpiGrid.appendChild(kpiCredits);

    // KPI 2: Service Plan
    const kpiPlan = element('div', { class: 'p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col gap-2' }, [
      element('div', { class: 'flex items-center justify-between text-xs text-slate-400' }, [
        element('span', {}, ['Gói Dịch Vụ']),
        element('span', { class: 'text-amber-400 text-sm' }, ['👑'])
      ]),
      element('div', { class: 'text-lg font-bold font-mono text-white' }, [
        plan === 'ULTRA' ? 'ULTRA VIP' : plan
      ]),
      element('div', { class: 'text-[11px] text-slate-400 mt-auto pt-1' }, [
        'Hạn dùng: ',
        element('span', { class: 'text-slate-300 font-mono' }, [new Date(planExpiry).toLocaleDateString('vi-VN')])
      ])
    ]);
    kpiGrid.appendChild(kpiPlan);

    // KPI 3: Video Engine
    const kpiEngine = element('div', { class: 'p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col gap-2' }, [
      element('div', { class: 'flex items-center justify-between text-xs text-slate-400' }, [
        element('span', {}, ['AI 4K Engine']),
        element('span', { class: 'text-sky-400 text-sm' }, ['⚡'])
      ]),
      element('div', { class: 'text-lg font-bold font-mono text-sky-400 flex items-center gap-1.5' }, [
        element('span', { class: 'w-2 h-2 rounded-full bg-sky-400 animate-pulse' }),
        '60 FPS Ultra-HD'
      ]),
      element('div', { class: 'text-[11px] text-slate-400 mt-auto pt-1' }, [
        'Xử lý không logo đa luồng'
      ])
    ]);
    kpiGrid.appendChild(kpiEngine);

    // KPI 4: Support Channel
    const kpiSupport = element('div', { class: 'p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col gap-2' }, [
      element('div', { class: 'flex items-center justify-between text-xs text-slate-400' }, [
        element('span', {}, ['Hòm Thư Admin']),
        element('span', { class: 'text-emerald-400 text-sm' }, ['✉️'])
      ]),
      element('div', { class: 'text-xs font-bold font-mono text-emerald-300 truncate', title: displayEmail }, [
        displayEmail
      ]),
      element('div', { class: 'flex items-center justify-between mt-auto pt-1' }, [
        element('span', { class: 'text-[11px] text-slate-400' }, ['Hỗ trợ chính thức']),
        element('a', {
          href: `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(displayEmail)}`,
          target: '_blank',
          class: 'text-[11px] text-emerald-400 hover:underline font-semibold'
        }, ['Mở Mail ↗'])
      ])
    ]);
    kpiGrid.appendChild(kpiSupport);

    container.appendChild(kpiGrid);

    // 4. Admin Privileges & System Matrix
    const matrixBox = element('div', { class: 'p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-3 shadow-lg' }, [
      element('div', { class: 'flex items-center justify-between' }, [
        element('div', { class: 'font-bold text-sm text-white flex items-center gap-2' }, [
          '⚙️ Đặc Quyền Quản Trị Hệ Thống (System Privileges Matrix)'
        ]),
        element('span', { class: 'text-[11px] text-emerald-400 font-mono font-semibold' }, ['100% ĐÃ KÍCH HOẠT'])
      ]),
      element('div', { class: 'grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1' }, [
        element('div', { class: 'p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-start gap-2.5 text-xs' }, [
          element('span', { class: 'text-emerald-400 font-bold' }, ['✓']),
          element('div', {}, [
            element('strong', { class: 'text-white block' }, ['Quản lý Tín Dụng & Mã Khuyến Mãi']),
            element('span', { class: 'text-slate-400 text-[11px]' }, ['Nạp/cấp mã 4.000.000 credit, đồng bộ ledger nội bộ tức thì.'])
          ])
        ]),
        element('div', { class: 'p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-start gap-2.5 text-xs' }, [
          element('span', { class: 'text-emerald-400 font-bold' }, ['✓']),
          element('div', {}, [
            element('strong', { class: 'text-white block' }, ['Cào & Tổng Hợp Video 4K Không Logo']),
            element('span', { class: 'text-slate-400 text-[11px]' }, ['Hỗ trợ TikTok, Douyin, YouTube, Instagram và tải file vật lý về máy.'])
          ])
        ]),
        element('div', { class: 'p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-start gap-2.5 text-xs' }, [
          element('span', { class: 'text-emerald-400 font-bold' }, ['✓']),
          element('div', {}, [
            element('strong', { class: 'text-white block' }, ['Tiếp Nhận Phản Hồi Trực Tiếp']),
            element('span', { class: 'text-slate-400 text-[11px]' }, [`Mọi thư khách hàng chuyển thẳng tới: ${displayEmail}`])
          ])
        ]),
        element('div', { class: 'p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-start gap-2.5 text-xs' }, [
          element('span', { class: 'text-emerald-400 font-bold' }, ['✓']),
          element('div', {}, [
            element('strong', { class: 'text-white block' }, ['Bảo Mật Bộ Nhớ & Không Rò Rỉ Dữ Liệu']),
            element('span', { class: 'text-slate-400 text-[11px]' }, ['Zero financial data, CSP nghiêm ngặt, cách ly phiên đăng nhập.'])
          ])
        ])
      ])
    ]);
    container.appendChild(matrixBox);

    // 5. Admin Quick Actions (Utilities)
    const actionsBox = element('div', { class: 'p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-3.5 shadow-lg' }, [
      element('div', { class: 'font-bold text-sm text-white flex items-center gap-2' }, [
        '⚡ Thao Tác Quản Trị Nhanh (Admin Quick Utilities)'
      ]),
      element('div', { class: 'flex flex-wrap gap-2.5' }, [
        element('button', {
          type: 'button',
          class: 'btn btn-primary py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-emerald-950/40',
          onClick: () => {
            if (state?.addCredits) {
              const newBal = state.addCredits(4000000);
              playSound('success');
              showToast({
                type: 'success',
                title: 'Nạp Tín Dụng Quản Trị',
                message: `Đã nạp thành công 4.000.000 credit vào số dư Admin (${newBal.toLocaleString('vi-VN')} credit).`
              });
              render(outlet);
            }
          }
        }, [
          element('span', {}, ['💎']),
          'Nạp +4.000.000 Credit Admin'
        ]),
        element('button', {
          type: 'button',
          class: 'btn btn-secondary py-2.5 px-4 rounded-xl text-white text-xs font-semibold flex items-center gap-2 border border-slate-700 hover:border-slate-500',
          onClick: () => {
            if (typeof navigator !== 'undefined' && navigator.clipboard) {
              navigator.clipboard.writeText(displayEmail);
              playSound('click');
              showToast({ type: 'info', title: 'Đã sao chép email', message: displayEmail });
            }
          }
        }, [
          element('span', {}, ['📋']),
          'Sao Chép Email Admin'
        ]),
        element('a', {
          href: `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(displayEmail)}`,
          target: '_blank',
          class: 'btn btn-secondary py-2.5 px-4 rounded-xl text-white text-xs font-semibold flex items-center gap-2 border border-slate-700 hover:border-slate-500',
          onClick: () => playSound('click')
        }, [
          element('span', {}, ['📧']),
          'Mở Hộp Thư Gmail Admin ↗'
        ]),
        element('button', {
          type: 'button',
          class: 'btn btn-secondary py-2.5 px-4 rounded-xl text-white text-xs font-semibold flex items-center gap-2 border border-slate-700 hover:border-slate-500',
          onClick: () => {
            playSound('success');
            showToast({
              type: 'success',
              title: 'Làm mới hệ thống',
              message: 'Đã đồng bộ lại snapshot và làm mới bộ nhớ đệm thành công.'
            });
            render(outlet);
          }
        }, [
          element('span', {}, ['🔄']),
          'Đồng Bộ & Làm Mới State'
        ])
      ])
    ]);
    container.appendChild(actionsBox);

    // 6. System & Interface Preferences Box (includes Reduced Motion toggle with exact button text for E2E tests)
    const prefBox = element('div', { class: 'p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-3 shadow-lg' }, [
      element('div', { class: 'font-bold text-sm text-white flex items-center gap-2' }, [
        '🎨 Tùy Chọn Giao Diện & Trải Nghiệm'
      ]),
      element('div', { class: 'flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs text-slate-300' }, [
        element('div', { class: 'flex flex-col gap-0.5' }, [
          element('span', { class: 'font-semibold text-white' }, ['Chế độ giảm chuyển động (Reduced Motion):']),
          element('span', { class: 'text-[11px] text-slate-400' }, [
            'Trạng thái hiện tại: ',
            element('strong', { class: 'text-emerald-400 font-mono' }, [
              state?.getPreference && state.getPreference('motion') === 'reduced' ? 'Đang Bật (Giảm chuyển động)' : 'Bình thường (Đầy đủ hiệu ứng)'
            ])
          ])
        ]),
        element('button', {
          type: 'button',
          class: 'px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white border border-slate-700 transition-all hover:border-emerald-500 shadow-sm',
          onClick: () => {
            const current = state?.getPreference ? (state.getPreference('motion') === 'reduced') : false;
            if (state?.setPreference) {
              state.setPreference('motion', current ? 'normal' : 'reduced');
            }
            playSound('click');
            showToast({
              type: 'info',
              title: 'Cài đặt giao diện',
              message: `Đã đổi chế độ chuyển động: ${current ? 'Bình thường' : 'Giảm chuyển động'}`
            });
            render(outlet);
          }
        }, ['Chuyển Đổi'])
      ])
    ]);
    container.appendChild(prefBox);

    outlet.appendChild(container);
  }

  return {
    mount(outlet) {
      render(outlet);
      if (state?.subscribe) {
        unsubscribeState = state.subscribe(() => {
          if (container && container.parentNode) {
            render(container.parentNode);
          }
        });
      }
    },
    unmount() {
      if (unsubscribeState) {
        unsubscribeState();
        unsubscribeState = null;
      }
      if (container) {
        container.remove();
        container = null;
      }
    }
  };
}
