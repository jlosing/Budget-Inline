import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from "@angular/fire/app";
import { getFirestore, provideFirestore } from "@angular/fire/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCXNKyD9LI9PYfG0ED8er-hrNfeVrP6GZc",
  authDomain: "budget-inline.firebaseapp.com",
  projectId: "budget-inline",
  storageBucket: "budget-inline.firebasestorage.app",
  messagingSenderId: "972459568849",
  appId: "1:972459568849:web:20b6d0484f03ac8aee5ff0",
  measurementId: "G-DNZ7CBF5DX"
};

// Initialize Firebase

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideFirestore(() => getFirestore())
  ]
};
