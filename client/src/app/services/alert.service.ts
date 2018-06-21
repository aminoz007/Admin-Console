import { Injectable } from '@angular/core';

@Injectable()
export class AlertService {

  alerts: IAlert[] = [];

  constructor() { }

  close(alert) {
    const index: number = this.alerts.indexOf(alert);
    this.alerts.splice(index, 1);
  }

  add(type: string, message: string) {
    this.alerts.push({type: type, message: message});
  }

  clear() {
    this.alerts = [];
  }
}

export interface IAlert {
  type: string;
  message: string;
}
