// @ts-nocheck
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(clients.claim()));

firebase.initializeApp({
  apiKey: "AIzaSyDgprN1NwyPRgWV_M0Y09dvwDnvjtFA3KI",
  authDomain: "defaultproject-746c0.firebaseapp.com",
  projectId: "defaultproject-746c0",
  storageBucket: "defaultproject-746c0.firebasestorage.app",
  messagingSenderId: "180398589167",
  appId: "1:180398589167:web:e5409ac591a9941347c71a",
  measurementId: "G-LWV9KHV485"
});

const messaging = firebase.messaging();

// Menangani background notifications
messaging.onBackgroundMessage((payload) => {
  console.log('Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/assets/icons/icon-128x128.png' // Ganti dengan path icon Anda
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});