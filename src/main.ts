import 'zone.js';
// import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideStorage, getStorage } from '@angular/fire/storage';
import { bootstrapApplication } from '@angular/platform-browser';

const firebaseConfig = {
  apiKey: "AIzaSyBnlmvYGlPyR0fTBqQOA4E81Nyk2nz_XTQ",
  authDomain: "anniversary-sh001.firebaseapp.com",
  projectId: "anniversary-sh001",
  storageBucket: "anniversary-sh001.firebasestorage.app",
  messagingSenderId: "331653542190",
  appId: "1:331653542190:web:bbcfbd1cf3f07b9f794abf",
  measurementId: "G-2HZYNC9K63"
};

bootstrapApplication(AppComponent, {
  providers: [
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage()),
  ]
}).catch((err: any) => console.error(err));