import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChildren,
  QueryList,
  ElementRef, OnInit
} from '@angular/core';
import {MovieService} from "../../services/movie.service";
import {Movie} from "../../models/movie.model";
import {Router} from "@angular/router";
import {AuthService} from "../../services/auth.service";
import {UserService} from "../../services/user.service";
import {NotificationService} from "../../services/notification.service";

@Component({
  selector: 'app-hero-section',
  templateUrl: './hero-section.component.html',
  styleUrls: ['./hero-section.component.scss']
})
export class HeroSectionComponent implements OnInit, OnChanges, OnDestroy {
  @Input() movies: Movie[] = [];
  @ViewChildren('videoPlayer') videoPlayers!: QueryList<ElementRef<HTMLVideoElement>>;
  slideshowMovies: Movie[] = [];
  currentMovieIndex = 0;
  currentMovie: Movie | null = null;
  isMuted = true;
  isShowPrompt = false;
  favoriteMovieIds = new Set<string>;
  processingMovieIds = new Set<string>;
  private slideInterval: any;
  private readonly SLIDE_DURATION = 15000;

  constructor(private router: Router, private authService: AuthService, private userService: UserService, private notification: NotificationService) {
  }

  ngOnInit() {
    this.loadInitialFavorites();
  }

  loadInitialFavorites(): void {
    if (this.authService.isLoggedIn()) {
      const userId = this.authService.getUserId();
      if (userId) {
        this.userService.getFavoriteMovies(userId).subscribe({
          next: result => {
            this.favoriteMovieIds.clear();
            result.forEach(movie => this.favoriteMovieIds.add(movie.id));
          },
          error: err => {
            console.log("Không thể tải danh sách yêu thích ban đầu", err);
          }
        });
      }
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['movies'] && this.movies && this.movies.length > 0) {
      this.slideshowMovies = this.movies.slice(-10);
      this.setupSlideshow();
    }
  }

  toggleFavorite(movie: Movie, event: MouseEvent) {
    event.stopPropagation();
    if (!this.authService.isLoggedIn()) {
      this.isShowPrompt = true;
      return;
    }
    const userId = this.authService.getUserId();
    if (!userId || this.isProcessing(movie.id)) {
      return;
    }
    this.processingMovieIds.add(movie.id);
    const isCurrentlyFavorite = this.isFavorite(movie.id);
    const action$ = isCurrentlyFavorite
      ? this.userService.deleteFavoriteMovie(userId, movie.id)
      : this.userService.postFavoriteMovie(userId, movie.id);
    action$.subscribe({
      next: () => {
        if (isCurrentlyFavorite) {
          this.favoriteMovieIds.delete(movie.id);
          this.notification.show("Xóa phim khỏi danh sách yêu thích thành công!", 'info');
        } else {
          this.favoriteMovieIds.add(movie.id);
          this.notification.show("Thêm phim vào danh sách yêu thích thành công!", "success")
        }
      },
      error: (err) => {
        this.notification.show("Thao tác thất bại", 'error')
      },
      complete: () => this.processingMovieIds.delete(movie.id)
    })
  }

  ngOnDestroy() {
    this.stopAutoSlide();
  }

  setupSlideshow(): void {
    this.currentMovieIndex = 0;
    this.currentMovie = this.movies[this.currentMovieIndex];
    this.restartAutoSlide();
    // Dùng setTimeout để đảm bảo view đã được render trước khi chạy video
    setTimeout(() => this.updateVideoPlayback(), 0);
  }

  private updateVideoPlayback(): void {
    this.videoPlayers.forEach((playerRef, index) => {
      const videoElement = playerRef.nativeElement;
      if (index === this.currentMovieIndex) {
        videoElement.muted = this.isMuted;
        videoElement.currentTime = 0;
        videoElement.play().catch(() => {
        });
      } else {
        videoElement.pause();
      }
    });
  }

  // --- Navigation methods ---
  nextSlide() {
    if (!this.slideshowMovies || this.slideshowMovies.length === 0) return;
    this.currentMovieIndex = (this.currentMovieIndex + 1) % this.slideshowMovies.length;
    this.currentMovie = this.slideshowMovies[this.currentMovieIndex];
    this.restartAutoSlide();
    this.updateVideoPlayback();
  }

  prevSlide() {
    if (!this.slideshowMovies || this.slideshowMovies.length === 0) return;
    this.currentMovieIndex = (this.currentMovieIndex - 1 + this.slideshowMovies.length) % this.slideshowMovies.length;
    this.currentMovie = this.slideshowMovies[this.currentMovieIndex];
    this.restartAutoSlide();
    this.updateVideoPlayback();
  }

  goToSlide(index: number) {
    if (index >= 0 && index < this.slideshowMovies.length) {
      this.currentMovieIndex = index;
      this.currentMovie = this.slideshowMovies[this.currentMovieIndex];
      this.restartAutoSlide();
      this.updateVideoPlayback();
    }
  }

  // --- Auto slide methods ---
  private startAutoSlide() {
    if (this.slideshowMovies.length > 1) {
      this.slideInterval = setInterval(() => this.nextSlide(), this.SLIDE_DURATION);
    }
  }

  private stopAutoSlide() {
    if (this.slideInterval) {
      clearInterval(this.slideInterval);
    }
  }

  private restartAutoSlide() {
    this.stopAutoSlide();
    this.startAutoSlide();
  }

  // --- Action methods ---
  onPlay(movie: Movie) {
    this.router.navigate(['/movies', movie.id]);
  }

  isFavorite(movieId: string):
    boolean {
    return this.favoriteMovieIds.has(movieId);
  }

  isProcessing(movieId: string): boolean {
    return this.processingMovieIds.has(movieId);
  }

  toggleSound(): void {
    this.isMuted = !this.isMuted;
    const activePlayer = this.videoPlayers.get(this.currentMovieIndex)?.nativeElement;
    if (activePlayer) {
      activePlayer.muted = this.isMuted;
    }
  }

  closeShowPrompt() {
    this.isShowPrompt = false;
  }
}
