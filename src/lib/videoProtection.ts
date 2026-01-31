/**
 * Video Protection Utilities
 * Comprehensive measures to prevent video downloading and leaking
 */

import { logger } from './logger';

/**
 * Disable common download shortcuts and methods
 */
export function initializeVideoProtection() {
  // Prevent right-click on entire document
  document.addEventListener('contextmenu', (e) => {
    const target = e.target as HTMLElement;
    if (target.closest('video') || target.closest('.video-protected') || target.closest('.protected-content')) {
      e.preventDefault();
      return false;
    }
  });

  // Prevent keyboard shortcuts for saving/downloading
  document.addEventListener('keydown', (e) => {
    // Prevent Ctrl+S, Ctrl+Shift+S
    if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
      e.preventDefault();
      return false;
    }
    
    // Prevent Ctrl+U (view source)
    if ((e.ctrlKey || e.metaKey) && (e.key === 'u' || e.key === 'U')) {
      if (!import.meta.env.DEV) {
        e.preventDefault();
        return false;
      }
    }
    
    // Prevent PrintScreen
    if (e.key === 'PrintScreen') {
      e.preventDefault();
      // Try to clear clipboard
      try {
        navigator.clipboard.writeText('');
      } catch {
        // Ignore clipboard errors
      }
      return false;
    }
    
    // Prevent Ctrl+P (print)
    if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P')) {
      e.preventDefault();
      return false;
    }
    
    // Prevent Windows screenshot shortcuts
    if ((e.metaKey || e.ctrlKey) && e.shiftKey && ['s', 'S', '3', '4', '5'].includes(e.key)) {
      e.preventDefault();
      return false;
    }
  });

  // Prevent drag and drop of video elements
  document.addEventListener('dragstart', (e) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'VIDEO' || target.closest('.video-protected')) {
      e.preventDefault();
      return false;
    }
  });

  logger.debug('Video protection initialized');
}

/**
 * Apply protection attributes to a video element
 */
export function applyVideoProtection(video: HTMLVideoElement) {
  video.setAttribute('controlsList', 'nodownload noremoteplayback');
  video.setAttribute('disablePictureInPicture', 'true');
  video.setAttribute('oncontextmenu', 'return false;');
  
  // Prevent text selection
  video.style.userSelect = 'none';
  video.style.webkitUserSelect = 'none';
  
  // Prevent dragging
  video.draggable = false;
  video.ondragstart = () => false;
}

/**
 * Detect screen recording attempts (basic detection)
 * This is not foolproof but adds a layer of protection
 */
export function detectScreenRecording(): boolean {
  // Check for common recording indicators
  if (typeof navigator.mediaDevices?.getDisplayMedia === 'function') {
    // Check if there are active screen captures
    // This is limited by browser APIs
  }
  
  // Check for unusual performance (recording can cause drops)
  const fps = measureFPS();
  if (fps < 15 && fps > 0) {
    logger.warn('Possible screen recording detected (low FPS)');
    return true;
  }
  
  return false;
}

let lastFrameTime = 0;
let frameCount = 0;
let fps = 60;

function measureFPS(): number {
  return fps;
}

/**
 * Start FPS monitoring
 */
export function startFPSMonitoring() {
  function updateFPS(timestamp: number) {
    frameCount++;
    
    if (timestamp - lastFrameTime >= 1000) {
      fps = frameCount;
      frameCount = 0;
      lastFrameTime = timestamp;
    }
    
    requestAnimationFrame(updateFPS);
  }
  
  requestAnimationFrame(updateFPS);
}

/**
 * Obfuscate video source URL
 * Adds a layer of confusion for source inspection
 */
export function obfuscateVideoUrl(url: string): string {
  // Add cache-busting parameter
  const timestamp = Date.now();
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}_t=${timestamp}`;
}

/**
 * Create blob URL for video (harder to extract)
 */
export async function createSecureVideoBlob(url: string): Promise<string | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    logger.error('Failed to create secure video blob:', error);
    return null;
  }
}

/**
 * Revoke blob URL when done
 */
export function revokeSecureVideoBlob(blobUrl: string) {
  if (blobUrl.startsWith('blob:')) {
    URL.revokeObjectURL(blobUrl);
  }
}

/**
 * Detect if DevTools is open
 */
export function isDevToolsOpen(): boolean {
  const threshold = 160;
  const widthThreshold = window.outerWidth - window.innerWidth > threshold;
  const heightThreshold = window.outerHeight - window.innerHeight > threshold;
  
  return widthThreshold || heightThreshold;
}

/**
 * Add watermark overlay to video container
 * Makes leaked videos traceable
 */
export function addVideoWatermark(container: HTMLElement, userId?: string) {
  const watermark = document.createElement('div');
  watermark.className = 'video-watermark';
  watermark.style.cssText = `
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 24px;
    color: rgba(255, 255, 255, 0.1);
    pointer-events: none;
    user-select: none;
    white-space: nowrap;
    z-index: 100;
  `;
  watermark.textContent = userId ? `ID: ${userId.slice(0, 8)}` : '';
  container.appendChild(watermark);
  
  return watermark;
}

/**
 * Monitor for suspicious activity
 */
export function monitorSuspiciousActivity(callback: (activity: string) => void) {
  // Monitor for DevTools opening
  let devToolsOpen = isDevToolsOpen();
  
  const checkDevTools = () => {
    const currentlyOpen = isDevToolsOpen();
    if (currentlyOpen && !devToolsOpen) {
      callback('devtools_opened');
    }
    devToolsOpen = currentlyOpen;
  };
  
  setInterval(checkDevTools, 1000);
  
  // Monitor for tab visibility changes
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      callback('tab_hidden');
    }
  });
  
  // Monitor for blur (user switching away)
  window.addEventListener('blur', () => {
    callback('window_blur');
  });
}
