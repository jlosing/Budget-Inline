import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UserService } from '../user.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
  userService = inject(UserService);

  email: string | null = null;

  ngOnInit(): void {
    this.userService.user$.subscribe(user => {
      if(user) {
        this.userService.currentUserSignal.set({
          email: user.email!,
          username: user.email!,
        });
      }
      else {
        this.userService.currentUserSignal.set(null);
      }
      this.email = user!.email;
      console.log(this.userService.currentUserSignal());
    });
  }
  
  logout(): void {
    this.userService.logout();
    this.email = null;
  }

}
