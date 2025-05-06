import { Injectable } from '@angular/core';

export interface user {
  uid: string,
  email: string,
  displayName: string,
}



@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor() { }
}
