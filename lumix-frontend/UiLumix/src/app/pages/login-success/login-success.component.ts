import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {AuthService} from "../../services/auth.service";
import {NotificationService} from "../../services/notification.service";

@Component({
  selector: 'app-login-success',
  templateUrl: './login-success.component.html',
  styleUrls: ['./login-success.component.scss']
})
export class LoginSuccessComponent implements OnInit {

  constructor(private route: ActivatedRoute, private router: Router, private authService: AuthService, private notification: NotificationService) {
  }

  ngOnInit(): void {
    this.handleLoginSuccess();
  }

  handleLoginSuccess() {
    this.route.queryParamMap.subscribe(params => {
      const userId = params.get("userId");
      const encodedUsername = params.get("username_b64");
      const error = params.get("error");

      if (userId && encodedUsername) {
        try {
          const decodedUsername = atob(encodedUsername);
          this.authService.handleOauthLogin(userId, decodedUsername);
          this.notification.show("Đăng nhập bằng Google thành công!", 'success');
          this.router.navigate(['/home']);
        } catch (e) {
          console.error("Lỗi khi giải mã username hoặc xử lý đăng nhập:", e);
          const errorMessage = "Đăng nhập thất bại: Dữ liệu người dùng không hợp lệ.";
          this.notification.show(errorMessage, 'error');
          this.router.navigate(['/login']);
        }
      } else {
        const errorMessage = error || "Đăng nhập Google thất bại.Vui lòng thử lại!";
        this.notification.show(errorMessage, 'error');
        this.router.navigate(['/login']);
      }
    })
  }

}
