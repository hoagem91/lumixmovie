import {Injectable} from "@angular/core";
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {Observable, throwError} from "rxjs";
import {catchError, map} from "rxjs/operators";
import {ApiResponse} from "../models/ApiResponse.model";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn:'root'
})
export class CommentService {
  private commentApiUrl = `${environment.apiUrl}/comments`

  constructor(private http: HttpClient) {
  }
  addLikeComment(commentId:string):Observable<any>{
    return this.http.post<ApiResponse<any>>(`${this.commentApiUrl}/${commentId}/like`,null).pipe(
      catchError(this.handleError)
    )
  }
  addDislikeComment(commentId:string):Observable<any>{
    return this.http.post<ApiResponse<any>>(`${this.commentApiUrl}/${commentId}/dislike`,null).pipe(
      catchError(this.handleError)
    )
  }
  private handleError(error: HttpErrorResponse) {
    let errorMessage = "Đã xảy ra lỗi không xác định";
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Lỗi: ${error.error.message}`;
    } else {
      switch (error.status) {
        case 404:
          errorMessage = 'Không tìm thấy dữ liệu';
          break;
        case 500:
          errorMessage = 'Lỗi server nội bộ';
          break;
        default:
          errorMessage = `Lỗi ${error.status}: ${error.message}`;
      }
    }
    console.error("API error: ", errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
