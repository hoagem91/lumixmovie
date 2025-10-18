import {Injectable} from "@angular/core";
import {BehaviorSubject, Observable} from "rxjs";

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: number
  message: string;
  type: NotificationType;
  duration: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationSubject = new BehaviorSubject<Notification[]>([]);
  public notification$: Observable<Notification[]> = this.notificationSubject.asObservable();
  private lastId = 0

  show(message: string, type: NotificationType, duration: number = 5000) {
    this.lastId++;
    const newNotification: Notification = {
      id: this.lastId,
      message,
      type,
      duration
    };
    const currentNotifications = this.notificationSubject.getValue();
    this.notificationSubject.next([...currentNotifications, newNotification])
    setTimeout(() => {
      this.remove(newNotification.id);
    }, duration);
  }

  remove(notificationId: number) {
    const updatedNotification = this.notificationSubject.getValue().filter(n => n.id != notificationId);
    this.notificationSubject.next(updatedNotification);
  }
}
