import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { AuthService } from './../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  constructor(public authService: AuthService, private router: Router) { }

  onLogin(username: string, password: string) {
    this.authService.login(username, password).subscribe(() => {
      if (this.authService.isLoggedIn()) {
        this.router.navigate(['/']);
        this.authService.errorMsg = '';
      }
    });
  }

  ngOnInit() {
  }

}
