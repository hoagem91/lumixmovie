import {Component, ElementRef, Input, OnInit, QueryList, ViewChild} from '@angular/core';
import {MovieService} from "../../services/movie.service";
import {AuthService} from "../../services/auth.service";
import {Router} from "@angular/router"; // 1. Import Router
import {Genre, Movie} from "../../models/movie.model";
import {UserService} from "../../services/user.service";
import {NotificationService} from "../../services/notification.service";

@Component({
  selector: 'app-movie-carousel',
  templateUrl: './movie-carousel.component.html',
  styleUrls: ['./movie-carousel.component.scss']
})
export class MovieCarouselComponent implements OnInit {
  @Input() title: string = '';
  @Input() subTitle: string = '';
  @Input() movies: any[] = [];
  @Input() isGenre: boolean = false;
  width!: string;
  height!: string;
  isLoading = false;
  hoveredMovieId: string | null = null;
  private hoverTime: any;
  showAuthPrompt = false;
  isMuted = true;
  favoriteMovieIds = new Set<string>;
  processingMovieIds = new Set<string>;
  @ViewChild("movieContainer") movieContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('videoPlayer') videoPlayers!: ElementRef<HTMLVideoElement>;
  currentIndex = 0;
  constructor(
    private userService: UserService,
    private authService: AuthService,
    private router: Router,
    private notification: NotificationService
  ) {
  }

  ngOnInit() {
    this.load();
    this.loadInitialFavorites();
  }

  private loadInitialFavorites(): void {
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

  private load() {
    this.isLoading = true;
    setTimeout(() => {
      this.isLoading = false
    }, 800);
  }

  setupResponsiveSkeleton(): number {
    const screenWidth = window.innerWidth;
    let numberRepeat: number;
    if (screenWidth <= 460) {
      return numberRepeat = 2;
    } else if (screenWidth <= 768) {
      return numberRepeat = 3;
    } else if (screenWidth <= 1200) {
      return numberRepeat = 5;
    } else {
      return numberRepeat = 7;
    }
  }

  scrollLeft()
    :
    void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    }
    const container = this.movieContainer.nativeElement;
    const scrollAmount = container.clientWidth * 0.8;
    container.scrollBy({left: -scrollAmount, behavior: 'smooth'});
  }
  scrollRight()
    :
    void {
    if (this.currentIndex < this.movies.length) {
      this.currentIndex++;
    }
    const container = this.movieContainer.nativeElement;
    const scrollAmount = container.clientWidth * 0.8;
    container.scrollBy({left: scrollAmount, behavior: 'smooth'});
  }

  onMouseEnter(movie: Movie): void {
    if (this.isGenre || !movie.videoUrl) return;
    this.clearHoverTimer();
    this.hoverTime = setTimeout(() => {
      this.hoveredMovieId = movie.id;
    }, 1000)
  }

  onMouseLeave(): void {
    this.clearHoverTimer();
    this.hoveredMovieId = null;
  }

  clearHoverTimer(): void {
    if (this.hoverTime
    ) {
      clearTimeout(this.hoverTime);
    }
  }

  playMovie(movie: Movie):
    void {
    if (this.authService.isLoggedIn()
    ) {
      this.router.navigate(['/movies', movie.id]);
    } else {
      this.showAuthPrompt = true;
    }
  }

  getMovieDetails(movie: Movie):
    void {
    this.router.navigate(['/movies', movie.id])
  }

  onMovieClick(item: Movie | Genre): void {
    if (!this.isGenre) {
      const movie = item as Movie;
      this.router.navigate(['/movies', movie.id]);
    } else {
      const genre = item as Genre;
      console.log('Navigating to genre page:', genre.name);
    }
  }

  toggleSound(event: Event): void {
    event.stopPropagation();
    this.isMuted = !this.isMuted;
    if (this.videoPlayers && this.videoPlayers.nativeElement
    ) {
      this.videoPlayers.nativeElement.muted = this.isMuted;
    }
  }

  closeAuthPrompt(): void {
    this.showAuthPrompt = false;
  }

  isFavorite(movieId: string):
    boolean {
    return this.favoriteMovieIds.has(movieId);
  }

  isProcessing(movieId: string): boolean {
    return this.processingMovieIds.has(movieId);
  }

  toggleFavorite(movie: Movie, event: MouseEvent) {
    event.stopPropagation();
    if (!this.authService.isLoggedIn()) {
      this.showAuthPrompt = true;
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
  onSeeAllClick(){
    this.router.navigate([`/category/${this.subTitle}`]);
  }
}
