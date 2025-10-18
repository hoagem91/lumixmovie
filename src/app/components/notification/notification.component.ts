import {Component, OnDestroy, OnInit} from '@angular/core';
import {animate, state, style, transition, trigger} from "@angular/animations";
import {Notification, NotificationService, NotificationType} from "../../services/notification.service";
import {Observable, Subscription} from "rxjs";

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
  animations: [
    trigger('toast', [
      transition(':enter', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateX(0)', opacity: 1 })),
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ transform: 'translateX(100%)', opacity: 0 })),
      ]),
    ])
  ]
})
export class NotificationComponent implements OnInit {
  public notifications$: Observable<Notification[]>;

  constructor(private notificationService: NotificationService) {
    this.notifications$ = this.notificationService.notification$;
  }

  ngOnInit(): void {
  }
  close(notification: Notification): void {
    this.notificationService.remove(notification.id);
  }

  getIcon(type: NotificationType): string {
    switch (type) {
      case 'success':
        return 'fas fa-check-circle';
      case 'error':
        return 'fas fa-times-circle';
      case "info":
        return 'fas fa-info-circle';
      case "warning":
        return 'fas fa-exclamation-triangle';
      default:
        return 'fas fa-bell';
    }
  }
}
