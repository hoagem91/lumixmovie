import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {AuthService} from "../../services/auth.service";
import {of, Subject, switchMap} from "rxjs";
import {NotificationService} from "../../services/notification.service";

@Component({
  selector: 'app-verify-account',
  templateUrl: './verify-account.component.html',
  styleUrls: ['./verify-account.component.scss']
})
export class VerifyAccountComponent implements OnInit {
  verificationStatus: 'loading' | 'success' | 'error'| 'pending' = 'loading';
  errorMessage: string | null = null;
  constructor(private route: ActivatedRoute, private authService: AuthService, private router: Router, private notification: NotificationService) {

  }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      const status = params.get('status');
      if(status === 'success'){
        this.verificationStatus = 'success';
        this.notification.show('Tài khoản đã được xác thực thành công!','success');
        setTimeout(()=>{
          this.router.navigate(['/login'])
        },3000);
      }else if(status === 'error'){
        this.verificationStatus = 'error';
        this.errorMessage = "Xác thực tài khoản không thành công!Có thể đã hết thời gian xác thực";
      }else{
        this.verificationStatus = 'pending';
      }
    })
  }
  navigateToLogin(){
    this.router.navigate(['/login']);
  }
}
