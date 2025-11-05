import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {AuthService} from "../../services/auth.service";
import {NotificationService} from "../../services/notification.service";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {environment} from "../../../environments/environment.prod";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm!:FormGroup;
  rememberMe: boolean = false;
  showPassword: boolean = false;
  isLoading: boolean = false;
  error: string | null = null;
  googleLoginUrl = `${environment.apiUrl}/login/oauth2/authorization/google`;
  constructor(private fb:FormBuilder,private authService: AuthService, private router: Router, private notification: NotificationService) {
    this.loginForm = this.fb.group({
      username: ['',[Validators.required,Validators.minLength(3)]],
      password: ['',[Validators.required,Validators.minLength(8)]],
      rememberMe: [false]
    })
  }

  ngOnInit(): void {
    const rememberMe = localStorage.getItem('rememberMe');
    if (rememberMe === 'true') {
      this.loginForm.value.username = localStorage.getItem('username') || '';
      this.rememberMe = true;
    }
  }

  onLogin(): void {
    if (this.isLoading) return;

    this.isLoading = true;
    this.error = null;

    this.authService.login(this.loginForm.value.username, this.loginForm.value.password).subscribe({
      next: () => {
        if (this.loginForm.value.rememberMe) {
          localStorage.setItem("rememberMe", 'true');
          localStorage.setItem("username", this.loginForm.value.username);
        } else {
          localStorage.removeItem("rememberMe");
          localStorage.removeItem("username");
        }
        this.router.navigate(['/home']);
        this.isLoading = false;
      },
      error: (error) => {
        if (error.status === 403 && error.error?.code === 1015) {
          this.notification.show("Tài khoản của bạn chưa được kích hoạt.Vui lòng kiểm tra email", 'warning')
        } else {
          this.error = "Tên tài khoản hoặc mật khẩu không đúng!";
          this.notification.show('Tên tài khoản hoặc mật khẩu không đúng!', 'error')
        }
        this.isLoading = false;
        console.log("Login Error!");
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}
