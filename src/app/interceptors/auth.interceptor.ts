import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { NotificationService } from '../services/notification.service';
import { environment } from '../../environments/environment';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    let modifiedReq = request;

    // ✅ Chỉ thêm withCredentials cho request gọi về backend
    if (request.url.startsWith(environment.apiUrl)) {
      modifiedReq = request.clone({
        withCredentials: true
      });
    }

    return next.handle(modifiedReq).pipe(
      catchError((error: HttpErrorResponse): Observable<HttpEvent<unknown>> => {
        if (error.status === 0) {
          this.notificationService.show("Vui lòng kiểm tra lại đường truyền internet!", 'error');
        } else if (error.status === 401) {
          this.notificationService.show("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.", 'error');
          this.router.navigate(['/login']);
        } else if (error.status === 403) {
          this.notificationService.show('Bạn không có quyền truy cập tài nguyên này.', 'error');
          this.router.navigate(['/forbidden']);
        } else if (error.status >= 500) {
          this.notificationService.show('Máy chủ đang gặp sự cố. Vui lòng thử lại sau.', 'error');
        }

        return throwError(() => error) as Observable<HttpEvent<unknown>>;
      })
    );
  }
}
