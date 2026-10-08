import { resolveModel, resolveAppleModel } from './device-names';

const CACHE_KEY = 'yawmi-device-name';

interface UADataLike {
  mobile?: boolean;
  platform?: string;
  getHighEntropyValues?: (hints: string[]) => Promise<Record<string, unknown>>;
}

function readCache(): string {
  try {
    return sessionStorage.getItem(CACHE_KEY) || '';
  } catch {
    return '';
  }
}

function writeCache(value: string) {
  try {
    sessionStorage.setItem(CACHE_KEY, value);
  } catch {}
}

function uaDeviceFallback(): string {
  const ua = navigator.userAgent;

  if (/Android/i.test(ua)) {
    // Older/WebView UAs still carry the model: "Linux; Android 13; RMX3085 Build/..."
    const m = ua.match(/Android\s[\d.]+\s*;\s*([^;)]+)/);
    const model = m?.[1]?.trim();
    if (model && model !== 'K' && !/^wv$/i.test(model)) {
      return resolveModel(model.replace(/\s+Build\/.*$/i, ''));
    }
    return 'Android';
  }

  if (/iPad/i.test(ua)) return 'iPad';
  if (/iPhone|iPod/i.test(ua)) return 'iPhone';

  if (/Macintosh|Mac OS/i.test(ua)) return 'Mac';
  if (/Windows/i.test(ua)) return 'Windows';
  if (/Linux/i.test(ua)) return 'Linux';

  return 'Unknown';
}

async function detectDeviceName(): Promise<string> {
  const uaData = (navigator as Navigator & { userAgentData?: UADataLike }).userAgentData;

  // Chromium (Android / Windows / Chrome OS): ask for the real model.
  if (uaData?.getHighEntropyValues) {
    try {
      const values = await uaData.getHighEntropyValues(['model', 'platform', 'platformVersion']);
      const model = typeof values.model === 'string' ? values.model.trim() : '';
      const platform = typeof values.platform === 'string' ? values.platform : '';

      if (model) {
        const resolved = resolveModel(model);
        if (resolved) return resolved;
      }

      // No model (desktop Chromium): build a platform string with version.
      if (platform && platform !== 'Android') {
        const version = typeof values.platformVersion === 'string' ? values.platformVersion : '';
        const major = version.split('.')[0];
        const label = platform === 'Windows' ? `Windows ${major === '10' ? '10/11' : major}` : platform;
        return label;
      }
    } catch {
      // fall through to UA parsing
    }
  }

  // iOS Safari (and all iOS browsers): infer model from physical screen pixels.
  if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
    const dpr = window.devicePixelRatio || 1;
    const physicalW = Math.round(screen.width * dpr);
    const physicalH = Math.round(screen.height * dpr);
    const isPad = /iPad/i.test(navigator.userAgent) || (navigator.maxTouchPoints > 1 && /Macintosh/.test(navigator.userAgent));
    const apple = resolveAppleModel(physicalW, physicalH, isPad);
    if (apple) return apple;
    return isPad ? 'iPad' : 'iPhone';
  }

  return uaDeviceFallback();
}

/**
 * Best-effort human-readable device name, e.g.
 * "Realme GT Neo 2", "iPhone 14 Pro/15/15 Pro", "Windows 10/11".
 * Resolved once per session; synchronous after first cache fill.
 */
export function getDeviceNameSync(): string {
  return readCache();
}

export async function getDeviceName(): Promise<string> {
  const cached = readCache();
  if (cached) return cached;

  let name = '';
  try {
    name = await detectDeviceName();
  } catch {
    name = uaDeviceFallback();
  }

  if (name) writeCache(name);
  return name;
}
