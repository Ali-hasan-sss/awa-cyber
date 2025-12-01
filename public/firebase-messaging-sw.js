// Import Firebase scripts
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js");

// Firebase configuration
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
firebase.initializeApp(firebaseConfig);

// Retrieve an instance of Firebase Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log("[firebase-messaging-sw.js] Received background message ", payload);

  const notificationTitle = payload.notification?.title || "New Notification";
  const notificationOptions = {
    body: payload.notification?.body || "",
    icon: payload.notification?.icon || "/images/logo.png",
    badge: "/images/logo.png",
    data: payload.data || {},
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

