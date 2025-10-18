import {Injectable} from "@angular/core";
import {environment} from "../../environments/environment";
import {HttpClient, HttpEventType, HttpRequest} from "@angular/common/http";
import {Observable} from "rxjs";
import {map} from "rxjs/operators";

export interface UploadEvent {
  progress: number;
  url?: string;
}

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  private uploadImageUrl = `${environment.apiUrl}/admin/movie/upload/image`;
  private uploadVideoUrl = `${environment.apiUrl}/admin/movie/upload/video`;

  constructor(private http: HttpClient) {
  }

  upload(file: File, type: 'image' | 'video'): Observable<UploadEvent> {
    const formData: FormData = new FormData();
    formData.append('file', file);
    const url = type === 'image' ? this.uploadImageUrl : this.uploadVideoUrl;
    const req = new HttpRequest('POST', url, formData, {
      reportProgress: true,
    });
    return this.http.request(req).pipe(
      map(event => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          const progress = Math.round(100 * event.loaded / event.total);
          return {progress, url: undefined};
        } else if (event.type === HttpEventType.Response) {
          const responseBody = event.body as any;
          const fileUrl = responseBody?.result?.url;
          return {progress: 100, url: fileUrl};
        }
        return {progress: 0, url: undefined};
      })
    );
  }
}
