import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpParams} from '@angular/common/http';
import {forkJoin, Observable, of, retry, throwError} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {Comment, Genre, Movie, WatchHistory} from "../models/movie.model";
import {environment} from "../../environments/environment";
import {CommentModel} from "../models/comment.model";
import {ApiResponse} from "../models/ApiResponse.model";

@Injectable({
  providedIn: 'root',
})
export class MovieService {
  private apiUrl = `${environment.apiUrl}/admin/movie`;
  private movieBaseUrl = `${environment.apiUrl}/movie`;
  private adminBaseUrl = `${environment.apiUrl}/admin`

  constructor(private http: HttpClient) {
  }

  createMovie(movieData: any): Observable<Movie> {
    return this.http.post<ApiResponse<Movie>>(this.apiUrl, movieData).pipe(
      map(res => res.result),
      catchError(this.handleError)
    )
  }

  deleteMovie(movieId: string): Observable<any> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${movieId}`).pipe(
      catchError(this.handleError)
    )
  }

  updateMovie(movieId: string, movieData: any): Observable<any> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/${movieId}`, movieData).pipe(
      catchError(this.handleError)
    )
  }

  getAllMovies(): Observable<Movie[]> {
    return this.http.get<ApiResponse<Movie[]>>(`${this.movieBaseUrl}/all`,{withCredentials:true}).pipe(
      map(res => res.result)
    );
  }

  getPopularMovies(): Observable<Movie[]> {
    return this.http.get<ApiResponse<Movie[]>>(`${this.movieBaseUrl}/popular`).pipe(
      map(res => res.result)
    );
  }

  getTrendingMovies(): Observable<Movie[]> {
    return this.http.get<ApiResponse<Movie[]>>(`${this.movieBaseUrl}/trending`).pipe(
      map(res => res.result)
    );
  }

  getAllGenre(): Observable<Genre[]> {
    return this.http.get<ApiResponse<Genre[]>>(`${this.movieBaseUrl}/genre`).pipe(
      map(res => res.result),
      retry(1),
      catchError(this.handleError)
    )
  }
  createGenre(genreName:string):Observable<Genre>{
    return this.http.post<ApiResponse<Genre>>(`${this.movieBaseUrl}/genre`,genreName).pipe(
      map(res => res.result),
      retry(1),
      catchError(this.handleError)
    )
  }
  updateGenre(genreId:string,genreName:string):Observable<any>{
    return this.http.put<ApiResponse<any>>(`${this.movieBaseUrl}/genre/${genreId}`,genreName).pipe(
      map(res => res.result),
      retry(1),
      catchError(this.handleError)
    )
  }
  deleteGenre(genreId:string):Observable<any>{
    return this.http.delete<ApiResponse<any>>(`${this.movieBaseUrl}/genre/${genreId}`).pipe(
      catchError(this.handleError)
    )
  }
  getMoviesByGenre(genreTitle: string): Observable<Movie[]> {
    const encodedGenre = encodeURIComponent(genreTitle);
    return this.http.get<ApiResponse<Movie[]>>(`${this.movieBaseUrl}/genre/${encodedGenre}`).pipe(
      map(res => res.result),
      retry(1),
      catchError(this.handleError)
    )
  }

  getMoviesByGenreName(genreName: string): Observable<Movie[]> {
    if (!genreName.trim()) {
      return of([]);
    }
    return this.http.get<ApiResponse<Movie[]>>(`${this.movieBaseUrl}/by-genres`, {
      params: {
        genres: genreName
      }
    }).pipe(
      map(res => res.result || []),
      retry(1),
      catchError(this.handleError)
    )
  }

  getMovieById(movieId: string): Observable<Movie> {
    return this.http.get<ApiResponse<Movie>>(`${this.movieBaseUrl}/${movieId}`).pipe(
      map(res => res.result),
      catchError(this.handleError)
    )
  }

  searchMovie(query: string): Observable<Movie[]> {
    if (!query.trim()) {
      return of([]);
    }
    return this.http.get<ApiResponse<{ content: Movie[] }>>(`${this.movieBaseUrl}/search`, {params: {title: query}}).pipe(
      map(response => response.result.content || [])
    )
  }

  getAllComment(): Observable<CommentModel[]> {
    return this.http.get<ApiResponse<CommentModel[]>>(`${this.movieBaseUrl}/comments`,{withCredentials:true}).pipe(
      map(res => res.result),
      catchError(this.handleError)
    )
  }

  getCommentsForMovie(movieId: string): Observable<CommentModel[]> {
    return this.http.get<ApiResponse<CommentModel[]>>(`${this.movieBaseUrl}/${movieId}/comments`).pipe(
      map(res => res.result || []),
      catchError(this.handleError)
    )
  }

  postComment(movieId: string, content: string,parentId?:string): Observable<CommentModel> {
    const payload :{content:string,parentId?:string} = {content}
    if(parentId) payload.parentId = parentId;
    return this.http.post<ApiResponse<CommentModel>>(`${this.movieBaseUrl}/${movieId}/comments`, payload).pipe(
      map(res => res.result),
      catchError(this.handleError)
    )
  }

  updateComment(movieId: string, commentId: string, content: string): Observable<CommentModel> {
    const payload = {content: content};
    return this.http.put<ApiResponse<CommentModel>>(`${this.movieBaseUrl}/${movieId}/comments/${commentId}`, payload).pipe(
      map(res => res.result),
      catchError(this.handleError)
    )
  }

  updateCommentModal(movieId: string, commentId: string, content: string): Observable<CommentModel> {
    const payload = {content: content};
    return this.http.put<ApiResponse<CommentModel>>(`${this.adminBaseUrl}/comments/${commentId}`, payload).pipe(
      map(res => res.result),
      catchError(this.handleError)
    )
  }

  deleteComment(movieId: string, commentId: string): Observable<any> {
    return this.http.delete<ApiResponse<any>>(`${this.movieBaseUrl}/${movieId}/comments/${commentId}`).pipe(
      catchError(this.handleError)
    )
  }

  deleteCommentForAdmin(commentIds: Array<string>): Observable<any> {
    const payload = {commentsIds: commentIds};
    return this.http.delete<ApiResponse<any>>(`${this.adminBaseUrl}/comments`, {body: payload}).pipe(
      catchError(this.handleError)
    )
  }

  searchComments(params: { searchText?: string, dateFrom?: string, dateTo?: string }): Observable<CommentModel[]> {
    const {searchText, dateFrom, dateTo} = params;
    if (!searchText) {
      let httpParams = new HttpParams();
      if (dateFrom) httpParams = httpParams.set('startDate', new Date(dateFrom).toISOString());
      if (dateTo) httpParams = httpParams.set('endDate', new Date(dateTo).toISOString());

      return this.http.get<ApiResponse<CommentModel[]>>(`${this.adminBaseUrl}/search/comments`, {params: httpParams}).pipe(
        map(res => res.result || []),
        catchError(this.handleError)
      );
    }

    const searchFields = ['content', 'username', 'movieName'];
    const searchObservables = searchFields.map(field => {
      let httpParams = new HttpParams().set(field, searchText);
      if (dateFrom) httpParams = httpParams.set('startDate', new Date(dateFrom).toISOString());
      if (dateTo) httpParams = httpParams.set('endDate', new Date(dateTo).toISOString());

      return this.http.get<ApiResponse<CommentModel[]>>(`${this.adminBaseUrl}/search/comments`, {params: httpParams,withCredentials:true}).pipe(
        map(res => res.result || []),
        catchError(() => of([]))
        );
    });

    return forkJoin(searchObservables).pipe(
      map(results => {
        const combined = results.flat();

        // Loại bỏ các bình luận trùng lặp bằng Map
        const uniqueComments = new Map<string, CommentModel>();
        for (const comment of combined) {
          if (!uniqueComments.has(comment.id)) {
            uniqueComments.set(comment.id, comment);
          }
        }
        return Array.from(uniqueComments.values());
      })
    );
  }
  findMoviesByGenres(genreName: string): Observable<Movie[]> {
    if (!genreName.trim()) {
      return of([]);
    }
    return this.http.get<ApiResponse<{
      content: Movie[]
    }>>(`${this.movieBaseUrl}/search`, {params: {genre: genreName}}).pipe(
      map(response => response.result.content || [])
    )
  }

  updateWatchProgress(movieId: string, progressInSeconds: number, isFinished: boolean): Observable<any> {
    const payload = {progressInSeconds, isFinished};
    return this.http.post<ApiResponse<any>>(`${environment.apiUrl}/history/progress/${movieId}`, payload).pipe(
      catchError(this.handleError)
    )
  }

  continueWatching(): Observable<WatchHistory[]> {
    return this.http.get<ApiResponse<WatchHistory[]>>(`${environment.apiUrl}/history/continue-watching`).pipe(
      map(res => res.result),
      catchError(this.handleError)
    )
  }

  deleteWatchHistory(movieId: string): Observable<any> {
    return this.http.delete<ApiResponse<any>>(`${environment.apiUrl}/history/${movieId}`).pipe(
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
