import {Component, OnInit} from '@angular/core';
import {Movie} from "../../models/movie.model";
import {UserService} from "../../services/user.service";
import {AuthService} from "../../services/auth.service";
import {Router} from "@angular/router";
import {NotificationService} from "../../services/notification.service";

@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.scss']
})
export class FavoritesComponent implements OnInit {
  favoriteMovies: Movie[] = [];
  isLoading = true;
  error: string | null = null;
  isDeleteMovie = false;

  constructor(private userService: UserService, private authService: AuthService, private router: Router,private notification:NotificationService) {
  }

  ngOnInit(): void {
    this.loadFavoriteMovies();
  }

  loadFavoriteMovies(): void {
    const userId = this.authService.getUserId();
    if (!userId) {
      this.error = "Vui lòng đăng nhập để xem danh sách yêu thích của bạn.";
      this.isLoading = false;
      return;
    }
    this.isLoading = true;
    this.userService.getFavoriteMovies(userId).subscribe({
      next: (movies) => {
        this.favoriteMovies = movies;
        this.isLoading = false;
      },
      error: (error) => {
        this.error = "Không thể tải danh sách yêu thích. Vui lòng thử lại sau.";
        this.isLoading = false;
        console.error("Lỗi khi tải danh sách yêu thích:", error);
      }
    });
  }

  deleteFavoriteMovie(movieId: string): void {
    const userId = this.authService.getUserId();
    if (!userId||!movieId||this.isDeleteMovie) return;
    this.isDeleteMovie = true;
    this.userService.deleteFavoriteMovie(userId,movieId).subscribe({
      next:()=>{
        this.isDeleteMovie = false;
        this.router.navigate(['/favorites']);
        this.notification.show("Xóa thành công",'success');
      },
      error:(err)=>{
        this.isDeleteMovie = false;
        this.notification.show("Xóa thất bại",'error');
      }
    })
  }

  viewMovieDetails(movieId: string): void {
    this.router.navigate(['movies', movieId]);
  }
}
