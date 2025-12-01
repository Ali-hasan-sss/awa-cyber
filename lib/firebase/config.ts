import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import {
  getMessaging,
  getToken,
  onMessage,
  Messaging,
} from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyDkcbV240dlPntbAXcuejXCuW7Q6pJ_bkQ",
  authDomain: "invare-bd572.firebaseapp.com",
  projectId: "invare-bd572",
  storageBucket: "invare-bd572.firebasestorage.app",
  messagingSenderId: "268628072160",
  appId: "1:268628072160:web:493db1deffb5c97c0ae285",
  measurementId: "G-S7R8T5F5Z9",
};

// Initialize Firebase
let app: FirebaseApp;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize Firebase Cloud Messaging and get a reference to the service
let messaging: Messaging | null = null;

if (typeof window !== "undefined" && "serviceWorker" in navigator) {
  try {
    messaging = getMessaging(app);
  } catch (error) {
    console.error("Firebase messaging initialization error:", error);
  }
}

// Request permission and get FCM token
export const requestNotificationPermission = async (): Promise<
  string | null
> => {
  if (!messaging) {
    console.warn("Firebase messaging is not available");
    return null;
  }

  try {
    // Register service worker
    if ("serviceWorker" in navigator) {
      const registration = await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js",
        { scope: "/" }
      );
      console.log("Service Worker registered:", registration);
    }

    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const token = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || "",
      });
      return token;
    } else {
      console.warn("Notification permission denied");
      return null;
    }
  } catch (error) {
    console.error("Error getting FCM token:", error);
    return null;
  }
};

// Listen for foreground messages
export const onMessageListener = () => {
  return new Promise((resolve) => {
    if (!messaging) {
      resolve(null);
      return;
    }
    onMessage(messaging, (payload: any) => {
      resolve(payload);
    });
  });
};

export { app, messaging };
