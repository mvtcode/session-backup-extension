import { encryptData, decryptData } from '../utils/crypto';

// DOM Elements
const btnBackup = document.getElementById('btn-backup') as HTMLButtonElement;
const btnRestore = document.getElementById('btn-restore') as HTMLButtonElement;
const restoreFileInput = document.getElementById(
  'restore-file',
) as HTMLInputElement;
const restorePasswordInput = document.getElementById(
  'restore-password',
) as HTMLInputElement;
const statusMsg = document.getElementById('status') as HTMLDivElement;
const statusText = document.getElementById('status-text') as HTMLSpanElement;
const btnCloseStatus = document.getElementById(
  'close-status',
) as HTMLButtonElement;
const versionEl = document.getElementById('app-version') as HTMLSpanElement;
const domainEl = document.getElementById('current-domain') as HTMLSpanElement;
const tabBtns = document.querySelectorAll('.tab-btn');
const panes = document.querySelectorAll('.pane');
const btnThemeToggle = document.getElementById(
  'theme-toggle',
) as HTMLButtonElement;
const sunIcon = document.querySelector('.sun-icon') as SVGElement;
const moonIcon = document.querySelector('.moon-icon') as SVGElement;
const btnLangToggle = document.getElementById(
  'lang-toggle',
) as HTMLButtonElement;
const currentLangEl = document.getElementById(
  'current-lang',
) as HTMLSpanElement;

// --- i18n Manager ---
let customMessages: any = null;
let currentLocale = 'vi';
let statusTimer: any = null;

const loadMessages = async (locale: string) => {
  try {
    const response = await fetch(
      chrome.runtime.getURL(`_locales/${locale}/messages.json`),
    );
    customMessages = await response.json();
    currentLocale = locale;
  } catch {
    console.error('Failed to load messages');
    customMessages = null;
  }
};

const getMessage = (key: string, substitutions?: string | string[]) => {
  if (customMessages && customMessages[key]) {
    let msg = customMessages[key].message;
    if (substitutions) {
      const subs = Array.isArray(substitutions)
        ? substitutions
        : [substitutions];
      subs.forEach((s, i) => {
        msg = msg.replace(`$${i + 1}`, s);
      });
    }
    return msg;
  }
  return chrome.i18n.getMessage(key, substitutions);
};

const applyI18n = () => {
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (key) {
      el.textContent = getMessage(key);
    }
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (key) {
      (el as HTMLInputElement).placeholder = getMessage(key);
    }
  });

  // Update lang toggle text
  if (currentLangEl) {
    currentLangEl.textContent = currentLocale.toUpperCase();
  }
};

const switchLanguage = async (locale: string) => {
  await chrome.storage.local.set({ forceLocale: locale });
  await loadMessages(locale);
  applyI18n();
  // Update buttons text that are already rendered
  btnBackup.textContent = getMessage('btnBackup');
  btnRestore.textContent = getMessage('btnRestore');
};

// --- Helper Functions ---

const showStatus = (
  msgKey: string,
  type: 'success' | 'warning' | 'error',
  isRaw = false,
  substitutions?: string[],
) => {
  if (statusTimer) {
    clearTimeout(statusTimer);
    statusTimer = null;
  }

  const msg = isRaw ? msgKey : getMessage(msgKey, substitutions) || msgKey;
  statusText.textContent = msg;
  statusMsg.className = `status-msg status-${type}`;
  statusMsg.style.display = 'flex';

  if (type !== 'warning') {
    statusTimer = setTimeout(() => {
      statusMsg.style.display = 'none';
      statusTimer = null;
    }, 5000);
  }
};

const initStatus = () => {
  btnCloseStatus.addEventListener('click', () => {
    statusMsg.style.display = 'none';
    if (statusTimer) {
      clearTimeout(statusTimer);
      statusTimer = null;
    }
  });
};

const initHeader = async () => {
  versionEl.textContent = `v${chrome.runtime.getManifest().version}`;

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.url) {
    try {
      domainEl.textContent = new URL(tab.url).hostname;
    } catch {
      domainEl.textContent = 'N/A';
    }
  }
};

const initTabs = () => {
  tabBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-tab');
      tabBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      panes.forEach((p) => {
        p.classList.remove('active');
        if (p.id === `${target}-pane`) {
          p.classList.add('active');
        }
      });
    });
  });
};

const initLangToggle = () => {
  btnLangToggle.addEventListener('click', () => {
    const nextLang = currentLocale === 'vi' ? 'en' : 'vi';
    switchLanguage(nextLang);
  });
};

// --- Theme Manager ---

const setTheme = (theme: 'light' | 'dark') => {
  document.documentElement.setAttribute('data-theme', theme);
  if (theme === 'dark') {
    sunIcon.style.display = 'none';
    moonIcon.style.display = 'block';
  } else {
    sunIcon.style.display = 'block';
    moonIcon.style.display = 'none';
  }
};

const initTheme = async () => {
  const data = (await chrome.storage.local.get('theme')) as {
    theme?: 'light' | 'dark';
  };
  const theme = data.theme || 'light';
  setTheme(theme);
};

const toggleTheme = async () => {
  const currentTheme =
    document.documentElement.getAttribute('data-theme') || 'light';
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  setTheme(newTheme);
  await chrome.storage.local.set({ theme: newTheme });
};

const initThemeToggle = () => {
  btnThemeToggle.addEventListener('click', toggleTheme);
};

/**
 * Initialize Link handlers to open in new tabs
 */
const initLinks = () => {
  document.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const url = link.getAttribute('href');
      if (url) {
        chrome.tabs.create({ url });
      }
    });
  });
};

const initBackupValidation = () => {
  const checkboxes = getBackupCheckboxes();

  checkboxes.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', updateBackupButtonState);
  });

  // Initial check
  updateBackupButtonState();
};

const getBackupCheckboxes = () => [
  'check-cookies',
  'check-ls',
  'check-ss',
  'check-idb',
  'check-cache',
];

const updateBackupButtonState = () => {
  const isAnyChecked = getBackupCheckboxes().some((id) => {
    const el = document.getElementById(id) as HTMLInputElement;
    return el && el.checked;
  });
  btnBackup.disabled = !isAnyChecked;
};

// --- Event Listeners ---

restoreFileInput.addEventListener('change', async () => {
  const file = restoreFileInput.files?.[0];
  if (!file) {
    btnRestore.disabled = true;
    restorePasswordInput.disabled = true;
    return;
  }

  try {
    const text = await file.text();
    const data = JSON.parse(text);

    const isEncrypted = !!data.encrypted;
    restorePasswordInput.disabled = !isEncrypted;

    // Domain Check
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    const currentDomain = tab?.url ? new URL(tab.url).hostname : '';
    const backupDomain =
      data.domain || (data.url ? new URL(data.url).hostname : '');

    if (backupDomain && currentDomain && backupDomain !== currentDomain) {
      showStatus('msgDomainMismatch', 'warning', false, [backupDomain]);
    } else if (isEncrypted) {
      showStatus('msgEncryptedFile', 'error');
    }

    btnRestore.disabled = false;
  } catch {
    showStatus('Incorrect format', 'error', true);
    btnRestore.disabled = true;
  }
});

btnBackup.addEventListener('click', async () => {
  try {
    btnBackup.disabled = true;
    btnBackup.textContent = '...';

    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (!tab?.id || !tab?.url) throw new Error(getMessage('msgNoActiveTab'));

    const checkCookies = (
      document.getElementById('check-cookies') as HTMLInputElement
    ).checked;
    const checkLS = (document.getElementById('check-ls') as HTMLInputElement)
      .checked;
    const checkSS = (document.getElementById('check-ss') as HTMLInputElement)
      .checked;
    const checkIDB = (document.getElementById('check-idb') as HTMLInputElement)
      .checked;
    const checkCache = (
      document.getElementById('check-cache') as HTMLInputElement
    ).checked;

    const response = await chrome.runtime.sendMessage({
      type: 'BACKUP_SESSION',
      payload: {
        tabId: tab.id,
        url: tab.url,
        options: {
          cookies: checkCookies,
          localStorage: checkLS,
          sessionStorage: checkSS,
          indexedDB: checkIDB,
          cacheStorage: checkCache,
        },
      },
    });

    if (!response.success) throw new Error(response.error);

    let finalData = response.data;
    const password = (
      document.getElementById('backup-password') as HTMLInputElement
    ).value;
    const isEncrypted = !!password;
    const domain = new URL(tab.url).hostname;

    if (isEncrypted) {
      const encryptedStr = await encryptData(
        JSON.stringify(finalData),
        password,
      );
      finalData = {
        encrypted: true,
        data: encryptedStr,
        url: tab.url,
        domain: domain,
        timestamp: new Date().toISOString(),
      };
    } else {
      finalData = {
        ...finalData,
        encrypted: false,
        url: tab.url,
        domain: domain,
        timestamp: new Date().toISOString(),
      };
    }

    const blob = new Blob([JSON.stringify(finalData, null, 2)], {
      type: 'application/json',
    });
    const downloadUrl = URL.createObjectURL(blob);
    const filename = `session_backup_${domain}_${new Date().getTime()}.json`;

    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    link.click();

    showStatus('msgBackupSuccess', 'success');
  } catch (error: any) {
    showStatus(error.message, 'error', true);
  } finally {
    updateBackupButtonState();
    btnBackup.textContent = getMessage('btnBackup');
  }
});

btnRestore.addEventListener('click', async () => {
  try {
    const file = restoreFileInput.files?.[0];
    if (!file) {
      showStatus('msgNoFile', 'error');
      return;
    }

    const text = await file.text();
    let backupData = JSON.parse(text);

    // Domain mismatch confirm
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    const currentDomain = tab?.url ? new URL(tab.url).hostname : '';
    const backupDomain =
      backupData.domain ||
      (backupData.url ? new URL(backupData.url).hostname : '');

    if (backupDomain && currentDomain && backupDomain !== currentDomain) {
      if (!confirm(getMessage('msgConfirmRestore'))) {
        return;
      }
    }

    btnRestore.disabled = true;
    btnRestore.textContent = '...';

    if (backupData.encrypted) {
      const password = restorePasswordInput.value;
      if (!password) {
        showStatus('msgEncryptedFile', 'error');
        btnRestore.disabled = false;
        btnRestore.textContent = getMessage('btnRestore');
        return;
      }

      try {
        const decrypted = await decryptData(backupData.data, password);
        backupData = JSON.parse(decrypted);
      } catch {
        throw new Error(getMessage('msgIncorrectPassword'));
      }
    }

    if (!tab?.id) throw new Error(getMessage('msgNoActiveTab'));

    const response = await chrome.runtime.sendMessage({
      type: 'RESTORE_SESSION',
      payload: {
        tabId: tab.id,
        url: tab.url,
        data: backupData,
        mode: 'overwrite',
      },
    });

    if (!response.success) throw new Error(response.error);

    const shouldRefresh = (
      document.getElementById('check-refresh') as HTMLInputElement
    ).checked;

    if (shouldRefresh) {
      showStatus('msgRefreshing', 'success');
      setTimeout(() => chrome.tabs.reload(tab.id!), 1000);
    } else {
      showStatus('msgRestoreSuccess', 'success');
    }
  } catch (error: any) {
    showStatus(error.message, 'error', true);
  } finally {
    btnRestore.disabled = false;
    btnRestore.textContent = getMessage('btnRestore');
  }
});

// Initialize everything
document.addEventListener('DOMContentLoaded', async () => {
  const data = (await chrome.storage.local.get('forceLocale')) as {
    forceLocale?: string;
  };
  const forceLocale = data.forceLocale || 'vi';

  await loadMessages(forceLocale);

  applyI18n();
  initHeader();
  initTabs();
  initLangToggle();
  initTheme();
  initThemeToggle();
  initLinks();
  initStatus();
  initBackupValidation();
});
