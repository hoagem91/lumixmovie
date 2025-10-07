import {Injectable} from "@angular/core";
import {environment} from "../../environments/environment";
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {Observable, throwError} from "rxjs";
import {catchError, map} from "rxjs/operators";
import {Movie} from "../models/movie.model";
import {User} from "../models/user.model";
import {NotificationService} from "./notification.service";
import {ApiResponse} from "../models/ApiResponse.model";

@Injectable({providedIn: "root"})
export class UserService {
  private userApiUrl = `${environment.apiUrl}/users`;
  private adminApiUrl = `${environment.apiUrl}/admin/users`;
  constructor(private http: HttpClient,private notification:NotificationService) {
  }
  getAllUsers():Observable<User[]>{
    return this.http.get<ApiResponse<User[]>>(`${this.userApiUrl}`,{withCredentials:true}).pipe(
      map(res=>res.result),
      catchError(this.handleError)
    );
  }
  createUser(userData:{username:string,email:string,password:string}):Observable<User>{
    return this.http.post<ApiResponse<User>>(`${this.userApiUrl}`,userData).pipe(
      map(res=>res.result),
      catchError(this.handleError)
    )
  }
  createUserByAdmin(userData:{username:string,email:string,password:string,roles:string[],enabled:string}):Observable<User>{
    return this.http.post<ApiResponse<User>>(`${this.adminApiUrl}/create`,userData).pipe(
      map(res=>res.result),
      catchError(this.handleError)
    )
  }
  updateUserById(userId: string, userData:Partial<User>):Observable<User> {
    return this.http.put<ApiResponse<User>>(`${this.userApiUrl}/${userId}`, userData).pipe(
      map(res => res.result),
      catchError(this.handleError)
    );
  }
  updateUserRoles(userId:string,roles:string[]):Observable<any>{
    const payload = {roles:roles};
    return this.http.put<ApiResponse<any>>(`${this.adminApiUrl}/${userId}/roles`,payload).pipe(
      catchError(this.handleError)
    )
  }
  deleteUserById(userId:string):Observable<any>{
    return this.http.delete<ApiResponse<User>>(`${this.userApiUrl}/${userId}`).pipe(
      catchError(this.handleError)
    )
  }
  getUserById(userId: string): Observable<User> {
    return this.http.get<ApiResponse<User>>(`${this.userApiUrl}/${userId}`).pipe(
      map(res => res.result),
      catchError(this.handleError)
    )
  }

  getFavoriteMovies(userId: string): Observable<Movie[]> {
    return this.http.get<ApiResponse<Movie[]>>(`${this.userApiUrl}/${userId}/favorites`).pipe(
      map(res => res.result),
      catchError(this.handleError)
    )
  }

  postFavoriteMovie(userId: string, movieId: string): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${this.userApiUrl}/${userId}/favorites`, {movieId}).pipe(
      catchError(this.handleError)
    )
  }

  deleteFavoriteMovie(userId: string, movieId: string): Observable<any> {
    return this.http.delete<ApiResponse<any>>(`${this.userApiUrl}/${userId}/favorites/${movieId}`).pipe(
      catchError(this.handleError)
    )
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = "Đã xảy ra lỗi không xác định";
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Lỗi: ${error.error.message}`;
    } else {
      switch (error.status) {
        case 403:
          errorMessage = 'Bạn không có quyền thực hiện hành động này.';
          this.notification.show(errorMessage,'warning')
          break;
        case 404:
          errorMessage = 'Không tìm thấy tài nguyên.';
          this.notification.show(errorMessage,'error')
          break;
        case 409:
          errorMessage = 'Phim đã có trong danh sách yêu thích.';
          this.notification.show(errorMessage,'info')
          break;
        case 500:
          errorMessage = 'Lỗi server nội bộ';
          this.notification.show(errorMessage,'error')
          break;
        default:
          errorMessage = `Lỗi ${error.status}: ${error.message}`;
      }
    }
    console.error("User Service API error: ", errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
