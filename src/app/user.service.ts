import { inject, Injectable, signal } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile, user } from '@angular/fire/auth';
import { from, Observable } from 'rxjs';

export interface user {
  // id: string,
  email: string,
  username: string,
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor() { }

  firebaseAuth= inject(Auth);
  user$ = user(this.firebaseAuth);
  currentUserSignal = signal<user | null | undefined>(undefined);
  currentUserEmail: string | null = null;

  register(email: string, username: string, password: string): Observable<void> {
    const promise = createUserWithEmailAndPassword(
      this.firebaseAuth, 
      email, 
      password,
    ).then(response => updateProfile(response.user, {displayName: username}));

    return from(promise);
  }

  login(email: string, password: string): Observable<void> {
    const promise = signInWithEmailAndPassword(
      this.firebaseAuth,
      email,
      password,
    ).then(() => {});

    return from(promise);
  }

  logout(): Observable<void> {
    const promise = signOut(this.firebaseAuth);
    return from(promise);
  }
}
