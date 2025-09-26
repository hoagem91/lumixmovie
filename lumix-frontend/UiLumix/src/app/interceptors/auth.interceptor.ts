import {Injectable} from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor, HttpErrorResponse
} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {AuthService} from "../services/auth.service";
import {Router} from "@angular/router";
import {NotificationService} from "../services/notification.service";
import {catchError} from "rxjs/operators";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {
  }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const reqWithCreds = request.clone({
      withCredentials:true
    });
    return next.handle(reqWithCreds).pipe(
      catchError((error: HttpErrorResponse) => {
        if(error.status === 0){
          this.notificationService.show("Vui lòng kiểm tra lại đường truyền internet!",'error');
        }
        if (error.status === 401) {
          this.authService.logout();
          this.notificationService.show('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.', 'error');
        }
        return throwError(() => error);
      })
    )
  }
}
