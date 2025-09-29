import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {AuthService} from "../../../services/auth.service";
import {Router} from "@angular/router";
import {NotificationService} from "../../../services/notification.service";

@Component({
  selector: 'app-login-admin',
  templateUrl: './login-admin.component.html',
  styleUrls: ['./login-admin.component.scss']
})
export class LoginAdminComponent implements OnInit {
  loginForm!: FormGroup;
  isLoading = false;
  showPassword = false;
  successMessage: string | null = null;
  error: string | null = null;

  constructor(private formBuilder: FormBuilder, private authService: AuthService, private router: Router, private notification: NotificationService) {
    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  ngOnInit(): void {
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    this.isLoading = true;
    this.authService.login(this.loginForm.value.username, this.loginForm.value.password).subscribe({
      next: () => {
        this.isLoading = false;
        setTimeout(()=>{
        this.router.navigate(['/admin/dashboard']);
        },1000);
      }, error: () => {
        this.isLoading = false;
        this.error = "Đăng nhập thất bại. Hãy kiểm tra lại tài khoản hoặc mật khẩu của bạn!"
        this.notification.show("Đăng nhập thất bại!", 'error');
      }
    })
  }
}
