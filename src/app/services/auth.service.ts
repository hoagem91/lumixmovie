import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, tap} from 'rxjs';// 1. Import environment
import {LoginResponse, RegisterResponse} from '../models/auth.model';
import {environment} from "../../environments/environment";
import {Router} from "@angular/router";
import {map} from "rxjs/operators"; // 2. Import interface (giả sử đã tạo file)

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private authUrl = `${environment.apiUrl}/auth`;
  private userUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient, private router: Router) {
  }

  private readonly USER_ID_KEY = "userId";
  private readonly USERNAME_KEY = "username";
  private readonly ROLE_KEY = "roles"

  login(username: string, password: string): Observable<LoginResponse> {
    const credentials = {username, password};
    return this.http.post<LoginResponse>(`${this.authUrl}/login`, credentials,{withCredentials:true}).pipe(
      tap(res => {
        if (res?.result?.userId) {
          localStorage.setItem(this.USER_ID_KEY, res.result.userId);
          if (res.result.username) {
            localStorage.setItem(this.USERNAME_KEY, res.result.username);
          }
          if (res.result.role && Array.isArray(res.result.role)) {
            const isAdmin = res.result.role.some(role => role === 'ADMIN')
            if (isAdmin) {
              localStorage.setItem(this.ROLE_KEY, 'ADMIN');
            } else {
              localStorage.removeItem(this.ROLE_KEY);
            }
          }
        }
      })
    );
  }
  refresh(): Observable<any> {
    return this.http.post(`${this.authUrl}/refresh`, {}, { withCredentials: true });
  }

  logout(): void {
    this.http.post(`${this.authUrl}/logout`,{}).subscribe({
      next:()=>{
        console.log("logout success")
        localStorage.removeItem(this.USERNAME_KEY);
        localStorage.removeItem(this.USER_ID_KEY);
        localStorage.removeItem(this.ROLE_KEY);
        localStorage.removeItem('rememberMe');
        this.router.navigate(['/login'])
      },
      error:(err)=>{
        console.error("Logout failed:", err);
        localStorage.removeItem(this.USERNAME_KEY);
        localStorage.removeItem(this.USER_ID_KEY);
        localStorage.removeItem(this.ROLE_KEY);
        localStorage.removeItem('rememberMe');
        this.router.navigate(['/login']);
      }
    })
  }

  register(username: string, password: string, email: string): Observable<RegisterResponse> {
    const newUser = {username, password, email}
    return this.http.post<RegisterResponse>(this.userUrl, newUser,{withCredentials:true});
  }

  getUserId() {
    return localStorage.getItem(this.USER_ID_KEY);
  }

  getUsername(): string | null {
    return localStorage.getItem(this.USERNAME_KEY);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem(this.USER_ID_KEY);
  }

  handleOauthLogin( userId: string, username: string): void {
    localStorage.setItem(this.USER_ID_KEY, userId);
    localStorage.setItem(this.USERNAME_KEY, username);
  }

  isAdmin(): boolean {
    return this.isLoggedIn() && localStorage.getItem(this.ROLE_KEY) === 'ADMIN';
  }
}
