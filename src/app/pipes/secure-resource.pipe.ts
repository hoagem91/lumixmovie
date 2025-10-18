import { Pipe, PipeTransform } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Pipe({
  name: 'secureImage'
})
export class SecureResourcePipe implements PipeTransform {

  constructor(
    private http: HttpClient,
    private sanitizer: DomSanitizer
  ) {}

  transform(url: string | null | undefined): Observable<SafeUrl> {
    if (!url) {
      // Trả về một Observable chứa đường dẫn ảnh mặc định
      return of('assets/images/placeholder.png');
    }

    return this.http.get(url, { responseType: 'blob' }).pipe(
      map(blob => {
        // Tạo một URL đối tượng từ blob dữ liệu ảnh
        const objectUrl = URL.createObjectURL(blob);
        // Báo cho Angular rằng URL này an toàn để sử dụng
        return this.sanitizer.bypassSecurityTrustUrl(objectUrl);
      }),
      catchError(() => {
        // Nếu có lỗi (ví dụ: 401, 404), trả về ảnh mặc định
        return of('assets/images/placeholder.png');
      })
    );
  }
}
