import {Component, OnDestroy, OnInit} from '@angular/core';
import {AuthService} from "../../services/auth.service";
import {Router} from "@angular/router";
import {finalize, takeUntil} from "rxjs/operators";
import {Subject} from "rxjs";
import {NotificationService} from "../../services/notification.service";

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit, OnDestroy {
  username = "";
  email = "";
  password = "";
  confirmPassword = "";
  showPassword: boolean = false;
  error: string | null = null;
  successMessage: string | null = null;
  isLoading = false;

  private destroy$ = new Subject<void>()

  constructor(private authService: AuthService, private router: Router, private notification: NotificationService) {
  }

  ngOnInit(): void {
  }

  onRegister() {
    this.error = null;
    this.successMessage = null;
    if (this.password != this.confirmPassword) {
      this.error = "Mật khẩu xác nhận không khớp!";
      return;
    }
    this.isLoading = true;
    this.authService.register(this.username, this.password, this.email).pipe(
      finalize(() => this.isLoading = false), takeUntil(this.destroy$)
    ).subscribe({
      next: (res) => {
        this.notification.show("Đăng ký thành công!Vui lòng kiểm tra email để kích hoạt tài khoản.", 'success')
        this.router.navigate(['/registration-pending']);
      },
      error: (err) => {
        this.error = 'Tên đăng ký hoặc email đã tồn tại hoặc có lỗi xảy ra.';
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
