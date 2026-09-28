import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { openGmailCompose } from '../js/pages/support.mjs';
import { createUnavailablePage } from '../js/pages/unavailable.mjs';
import {
  getSessionDownloads,
  addSessionDownload,
  removeSessionDownload,
  getSessionHistory,
  addSessionHistory,
  createSyntheticMp4Blob,
  identifyPlatform,
  resolveCleanVideo,
  triggerBrowserFileDownload
} from '../js/media-downloader.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

test('navigation contains only approved pages in exact order with no removed tabs or invented counts', () => {
  const html = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');

  // Check sidebar navigation items
  const sidebarNavMatch = html.match(/<nav class="sidebar-nav"[^>]*>([\s\S]*?)<\/nav>/);
  assert.ok(sidebarNavMatch, 'sidebarNav exists');
  const sidebarContent = sidebarNavMatch[1];

  const pageMatches = [...sidebarContent.matchAll(/data-page="([^"]+)"/g)].map(m => m[1]);
  const expectedOrder = [
    'dashboard',
    'download-link',
    'downloaded',
    'history',
    'settings',
    'support',
    'pricing'
  ];
  assert.deepEqual(pageMatches, expectedOrder, 'navigation order must be exact');

  // Verify removed tabs are absent
  const removedTabs = ['auto-post', 'voice', 'split', 'render', 'automation', 'channel-monitor'];
  for (const tab of removedTabs) {
    assert.equal(html.includes(`data-page="${tab}"`), false, `removed tab ${tab} must not exist`);
  }

  // Verify hardcoded fake download count is removed
  assert.equal(html.includes('>8<'), false, 'hardcoded fake library count 8 must not exist');

  // Verify legacy scripts are not loaded
  assert.equal(html.includes('js/engine-resolver.js'), false, 'legacy engine-resolver must not be loaded');
  assert.equal(html.includes('js/page-dashboard.js'), false, 'legacy page-dashboard must not be loaded');
  assert.equal(html.includes('js/page-pricing.js'), false, 'legacy page-pricing must not be loaded');
  assert.equal(html.includes('js/app.js'), false, 'legacy app.js must not be loaded');
});

test('openGmailCompose builds secure Gmail URL with signature and opens window', async () => {
  let openedUrl = null;
  const mockWindowRef = {
    open(url) {
      openedUrl = url;
      return {};
    }
  };

  const result = await openGmailCompose({
    windowRef: mockWindowRef,
    fields: {
      subject: 'Hỗ trợ tải video 4K',
      contact: 'test@2tech.mn',
      message: 'Tôi cần hướng dẫn cào video không logo.'
    },
    supportEmail: 'support@2tech.mn'
  });

  assert.equal(result, 'opened');
  assert.ok(openedUrl.startsWith('https://mail.google.com/mail/'));
  assert.ok(openedUrl.includes('support%402tech.mn') || openedUrl.includes('support@2tech.mn'));
  assert.ok(openedUrl.includes('H%E1%BB%97+tr%E1%BB%A3') || openedUrl.includes('H%E1%BB%97%20tr%E1%BB%A3'));
  assert.ok(openedUrl.includes('Nguy%E1%BB%85n+Minh+Nh%E1%BB%B1t') || openedUrl.includes('Nguy%E1%BB%85n%20Minh%20Nh%E1%BB%B1t'));
});

test('openGmailCompose uses desktopOpen API if available', async () => {
  let desktopTarget = null;
  const mockDesktopOpen = async (url) => {
    desktopTarget = url;
    return { ok: true };
  };

  const result = await openGmailCompose({
    desktopOpen: mockDesktopOpen,
    fields: {
      subject: 'Yêu cầu mở rộng API',
      message: 'Cần hỗ trợ tải hàng loạt.'
    }
  });

  assert.equal(result, 'opened');
  assert.ok(desktopTarget.startsWith('https://mail.google.com/mail/'));
});

test('openGmailCompose sanitizes control characters and requires subject and message', async () => {
  await assert.rejects(
    () => openGmailCompose({ fields: { subject: '', message: 'test' } }),
    /Tiêu đề không được để trống/
  );

  await assert.rejects(
    () => openGmailCompose({ fields: { subject: 'test', message: '' } }),
    /Nội dung không được để trống/
  );

  let openedUrl = null;
  const mockWindowRef = {
    open(url) {
      openedUrl = url;
      return {};
    }
  };

  await openGmailCompose({
    windowRef: mockWindowRef,
    fields: {
      subject: 'Tiêu đề\x00\x08 test',
      message: 'Nội dung\x0C an toàn'
    }
  });

  assert.equal(openedUrl.includes('%00'), false);
  assert.equal(openedUrl.includes('%08'), false);
});

test('openGmailCompose falls back to same tab if popup is blocked', async () => {
  let locationHref = null;
  const mockWindowRef = {
    open() {
      return null; // popup blocked
    },
    location: {
      set href(val) {
        locationHref = val;
      }
    }
  };

  const result = await openGmailCompose({
    windowRef: mockWindowRef,
    fields: {
      subject: 'Thắc mắc lỗi tải',
      contact: 'user@example.com',
      message: 'Video báo lỗi mạng.'
    }
  });

  assert.equal(result, 'same-tab');
  assert.ok(locationHref.startsWith('https://mail.google.com/mail/'));
});

test('createUnavailablePage renders honest state and disclaimer', () => {
  const prevDoc = globalThis.document;
  globalThis.document = {
    createElement(tag) {
      return {
        tagName: tag.toUpperCase(),
        children: [],
        style: {},
        setAttribute() {},
        appendChild(c) { this.children.push(c); return c; },
        remove() {}
      };
    },
    createTextNode(val) { return String(val); }
  };

  try {
    const page = createUnavailablePage({
      title: 'Tính năng tải đang chờ kết nối Backend',
      reason: 'Trang web đang chạy trên GitHub Pages tĩnh. Cần khởi động backend Node.js v24 để thực hiện tải video thật.'
    });

    assert.ok(typeof page.mount === 'function');
    assert.ok(typeof page.unmount === 'function');

    const mockOutlet = { innerHTML: '', appendChild() {} };
    page.mount(mockOutlet);
    page.unmount();
  } finally {
    globalThis.document = prevDoc;
  }
});

test('media-downloader manages in-memory session downloads, history, and synthetic MP4 blobs', () => {
  addSessionDownload({
    id: 'test-1',
    title: 'Test 4K Video',
    platform: 'TikTok',
    quality: '4K 60FPS',
    size: '52.4 MB',
    filename: '2TECH_4K_TikTok_test-1.mp4'
  });

  const downloads = getSessionDownloads();
  assert.equal(downloads.length >= 1, true);
  const found = downloads.find(d => d.id === 'test-1');
  assert.ok(found);
  assert.equal(found.title, 'Test 4K Video');

  addSessionHistory({
    ts: '12:00:00 28/09/2026',
    platform: 'TikTok',
    name: 'Test 4K Video',
    res: '4K 60FPS',
    status: 'Hoàn tất'
  });

  const history = getSessionHistory();
  assert.equal(history.length >= 1, true);
  assert.equal(history[0].name, 'Test 4K Video');

  const mp4Blob = createSyntheticMp4Blob('Test 4K Video');
  assert.ok(mp4Blob instanceof Blob);
  assert.equal(mp4Blob.type, 'video/mp4');
  assert.equal(mp4Blob.size > 40, true);

  removeSessionDownload('test-1');
  const remaining = getSessionDownloads();
  assert.equal(remaining.some(d => d.id === 'test-1'), false);
});

test('identifyPlatform correctly classifies supported social video services', () => {
  assert.equal(identifyPlatform('https://www.tiktok.com/@user/video/12345'), 'TikTok');
  assert.equal(identifyPlatform('https://vt.tiktok.com/ZS2VqU1H8/'), 'TikTok');
  assert.equal(identifyPlatform('https://v.douyin.com/iRoLkd1/'), 'Douyin');
  assert.equal(identifyPlatform('https://www.youtube.com/watch?v=aqz-KE-bpKQ'), 'YouTube');
  assert.equal(identifyPlatform('https://youtu.be/5kM3N2_4K90'), 'YouTube');
  assert.equal(identifyPlatform('https://www.facebook.com/reel/102938475647382'), 'Facebook');
  assert.equal(identifyPlatform('https://www.instagram.com/reel/C123456789/'), 'Instagram');
  assert.equal(identifyPlatform('https://www.xiaohongshu.com/discovery/item/123'), 'Xiaohongshu');
});

test('resolveCleanVideo rejects empty input honestly and handles errors safely', async () => {
  const emptyRes = await resolveCleanVideo('');
  assert.equal(emptyRes.success, false);
  assert.ok(emptyRes.error);

  const invalidRes = await resolveCleanVideo('https://unknown-service.com/video/123');
  assert.equal(invalidRes.success, false);
  assert.ok(invalidRes.error);
});

test('triggerBrowserFileDownload safely rejects null/undefined sources without creating corrupt files', async () => {
  const result = await triggerBrowserFileDownload(null);
  assert.equal(result, false);

  const undefResult = await triggerBrowserFileDownload(undefined);
  assert.equal(undefResult, false);
});

