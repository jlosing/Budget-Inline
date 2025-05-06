import { inject, Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, updateProfile } from '@angular/fire/auth';
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

  register(
    // id: string,
    email: string,
    username: string,
    password: string,
  ): Observable<void> {
    const promise = createUserWithEmailAndPassword(
      this.firebaseAuth, 
      email, 
      password,
    ).then(response => updateProfile(response.user, {displayName: username}));

    return from(promise);
  }
}
