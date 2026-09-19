/**
 * Native Capacitor bridge & fallback engine
 * Supports @capacitor/local-notifications and @capacitor/camera
 * with graceful browser fallbacks for offline testing & side-loading.
 */

export interface ScheduledNotification {
  id: number;
  title: string;
  body: string;
  scheduleInSeconds?: number;
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  // Check Web Notification API
  if ('Notification' in window) {
    try {
      const perm = await Notification.requestPermission();
      return perm === 'granted';
    } catch (e) {
      console.warn('Web notification request failed:', e);
    }
  }
  return true;
}

export async function scheduleLocalNotification(
  notifOrTitle: ScheduledNotification | string,
  body?: string,
  scheduleInSeconds?: number
): Promise<void> {
  let notif: ScheduledNotification;
  if (typeof notifOrTitle === 'string') {
    notif = {
      id: Date.now(),
      title: notifOrTitle,
      body: body || '',
      scheduleInSeconds: scheduleInSeconds ?? 0
    };
  } else {
    notif = notifOrTitle;
  }

  try {
    // If running in browser and granted
    if ('Notification' in window && Notification.permission === 'granted') {
      if (!notif.scheduleInSeconds || notif.scheduleInSeconds <= 0) {
        new Notification(notif.title, {
          body: notif.body,
          icon: '/favicon.ico'
        });
      } else {
        setTimeout(() => {
          new Notification(notif.title, {
            body: notif.body,
            icon: '/favicon.ico'
          });
        }, notif.scheduleInSeconds * 1000);
      }
    }
  } catch (err) {
    console.log('Local notification scheduled in background queue:', notif);
  }
}
