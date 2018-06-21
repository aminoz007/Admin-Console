import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './../services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  headerClick = {msg: false, task: false, notification: false, user: false};

  listMsg = [
    {sender: 'John Smith', date: 'Yesterday', text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque eleifend...'},
    {sender: 'John Smith', date: 'Yesterday', text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque eleifend...'},
    {sender: 'John Smith', date: 'Yesterday', text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque eleifend...'}
  ];

  listTasks = [
    {name: 'Task: Compare to UP', progress: 20, status: 'success'},
    {name: 'Task: Get accounts token', progress: 40, status: 'info'},
    {name: 'Task: Compare entitlements', progress: 60, status: 'warning'},
    {name: 'Task: Discrpenacy CW', progress: 80, status: 'danger'}
  ];

  listNotif = [
    {text: 'New Comment', time: '4 minutes ago', type: 'comment'},
    {text: 'Message Sent', time: '4 minutes ago', type: 'envelope'},
    {text: 'New Task', time: '4 minutes ago', type: 'tasks'},
    {text: 'Server Rebooted', time: '4 minutes ago', type: 'upload'}
  ];

  constructor(private authService: AuthService, private router: Router) { }

  onClick(button: any): void {
    Object.entries(this.headerClick).forEach(
      ([key, value]) => {
        if (key === button) {
          this.headerClick[key] = !this.headerClick[key];
        } else {
          this.headerClick[key] = false;
        }
      }
    );
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  ngOnInit() {
  }

}
