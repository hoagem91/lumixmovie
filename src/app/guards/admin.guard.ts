import {Injectable} from "@angular/core";
import {CanActivate, Router} from "@angular/router";
import {AuthService} from "../services/auth.service";
import {NotificationService} from "../services/notification.service";

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate{
  constructor(private authService:AuthService,private router:Router,private notification:NotificationService) {
  }
  canActivate():boolean{
    if(this.authService.isAdmin()){
      return true;
    }
    else{
      this.notification.show("Bạn phải có quyền truy cập của Admin để vào trang này!","warning");
      this.router.navigate(['/admin/login']);
      return false;
    }
  }
}
