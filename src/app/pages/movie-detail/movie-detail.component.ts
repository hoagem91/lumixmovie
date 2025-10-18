import {Component, ElementRef, HostListener, OnInit, ViewChild} from '@angular/core';
import {Movie, WatchHistory} from "../../models/movie.model";
import {ActivatedRoute, Router} from "@angular/router";
import {MovieService} from "../../services/movie.service";
import {of, switchMap} from "rxjs";
import {UserService} from "../../services/user.service";
import {AuthService} from "../../services/auth.service";
import {catchError, map} from "rxjs/operators";
import {NotificationService} from "../../services/notification.service";

@Component({
  selector: 'app-movie-detail',
  templateUrl: './movie-detail.component.html',
  styleUrls: ['./movie-detail.component.scss']
})
export class MovieDetailComponent implements OnInit {
  movie: Movie | null = null;
  loading = true;
  error: string | null = null;
  favoriteMovieIds = new Set<string>;
  processingMovieIds = new Set<string>;
  isVideoPlaying = false;
  relatedMovies: Movie[] = [];
  showSeekControls = false;
  historyItems: WatchHistory[] = [];
  isVisible = false;
  promptTitle="";
  promptMessage = "";

  private seekControlsTimeout: any;
  private readonly UPDATE_INTERVAL = 15000;
  private progressUpdateTimer: any;

  @ViewChild('videoPlayer') videoPlayer!: ElementRef<HTMLVideoElement>;
  @ViewChild('videoSection') videoSection!: ElementRef<HTMLElement>;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
    private movieService: MovieService,
    private notification: NotificationService
  ) {

  }

  ngOnInit(): void {
    this.loadInitialFavorites();
    this.loadInitialData();
    this.loadHistory();
  }

  private loadInitialData() {
    this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('id');
        if (id) {
          this.loading = true;
          return this.movieService.getMovieById(id);
        }
        this.router.navigate(['/movies']);
        return of(null);
      }),
      switchMap(movieData => {
        if (!movieData) {
          return of({movie: null, related: []});
        }
        const primaryGenre = movieData.genres?.[0];
        if (!primaryGenre) {
          return of({movie: movieData, related: []});
        }
        return this.movieService.getMoviesByGenreName(`${primaryGenre}`).pipe(
          catchError(() => of([])),
          map(relatedData => {
            const filteredRelated = relatedData.filter(m => m.id != movieData.id);
            return {movie: movieData, related: filteredRelated};
          })
        );
      })
    ).subscribe({
      next: (data) => {
        this.movie = data.movie;
        this.relatedMovies = data.related;
        this.loading = false;
        this.seekToSavedPosition();
      },
      error: (err) => {
        this.error = 'Không thể tải thông tin phim. Vui lòng thử lại sau.';
        this.loading = false;
        console.error('Lỗi khi tải thông tin phim:', err);
      }
    })
  }

  private loadInitialFavorites() {
    if (this.authService.isLoggedIn()) {
      const userId = this.authService.getUserId();
      if (userId) {
        this.userService.getFavoriteMovies(userId).subscribe({
          next: result => {
            this.favoriteMovieIds.clear();
            result.forEach(movie => this.favoriteMovieIds.add(movie.id));
          },
          error: () => {
            this.notification.show("Không thể tải danh sách yêu thích ban đầu", 'error');
          }
        })
      }
    }
  }

  private loadHistory() {
    this.loading = true;
    this.error = null;
    if (this.authService.isLoggedIn()) {
      this.movieService.continueWatching().subscribe({
        next: (historyItems) => {
          this.historyItems = historyItems;
          this.loading = false;
        },
        error: (err) => {
          this.loading = false;
          this.notification.show("Không thể tải lịch sử xem của ban!", "error");
        }
      })
    }
  }

  handleItemDelete(movieDeleteId: string) {
    this.historyItems = this.historyItems.filter(item => item.movie.id != movieDeleteId);
  }

  public seekToSavedPosition() {
    if (!this.movie || !this.authService.isLoggedIn()) {
      return;
    }
    this.movieService.continueWatching().subscribe({
      next: (historyItems: WatchHistory[]) => {
        const currentMovieHistory = historyItems.find(item => item.movie.id === this.movie!.id)
        if (currentMovieHistory && currentMovieHistory.progressInSeconds > 5) {
          this.isVisible = true;
          this.promptTitle = "Xác nhận"
          this.promptMessage = `Tiếp tục xem từ ${this.formatTime(currentMovieHistory.progressInSeconds)}`
          setTimeout(() => {
            if (currentMovieHistory && this.videoPlayer.nativeElement) {
              this.videoPlayer.nativeElement.currentTime = currentMovieHistory.progressInSeconds;
            }
          }, 200);
        }
      },
      error: err => this.isVisible = false
    })
  }
  goBack() {
    this.router.navigate(['/movies'])
  }

  isFavorite(movieId: string) {
    return this.favoriteMovieIds.has(movieId);
  }

  isProcessing(movieId: string) {
    return this.processingMovieIds.has(movieId);
  }

  toggleFavorite(movie: Movie, event: MouseEvent) {
    event.stopPropagation();
    if (!this.authService.isLoggedIn()) {
      this.notification.show("Hãy đăng nhập để trải nghiệm!", "warning");
    }
    const userId = this.authService.getUserId();
    if (!userId || this.isProcessing(movie.id)) return;
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
      error: () => {
        this.notification.show("Thao tác thất bại", 'error');
      },
      complete: () => this.processingMovieIds.delete(movie.id)
    })
  }

  onConfirmPrompt(){
    this.isVisible = false;
    this.playVideo();
  }
  playVideo() {
    if (this.movie && this.movie.videoUrl) {
      this.videoSection.nativeElement.scrollIntoView({behavior: 'smooth', block: "center"});
      this.isVideoPlaying = true;
      setTimeout(() => {
        this.videoPlayer.nativeElement.play();
      }, 300)
    }
  }

  seekVideo(seconds: number) {
    if (this.videoPlayer && this.videoPlayer.nativeElement) {
      const video = this.videoPlayer.nativeElement;
      video.currentTime += seconds;
      this.onPlayerMouseEnter();
      this.onPlayerMouseLeave();
    }
  }

  onTimeUpdate() {
  }

  onVideoPlay() {
    this.isVideoPlaying = true;
    this.clearHideControlsTimer();
    this.startProgressUpdater();
  }

  onVideoPause() {
    this.isVideoPlaying = false;
    this.startHideControlsTimer();
    this.showSeekControls = true;
    this.stopProgressUpdater();
    this.updateCurrentProgress(false);
  }

  onVideoEnded() {
    this.isVideoPlaying = false;
    this.stopProgressUpdater();
    this.updateCurrentProgress(true);
  }

  onPlayerMouseEnter() {
    if (this.isVideoPlaying) {
      this.clearHideControlsTimer();
      this.showSeekControls = true;
    }
  }

  onPlayerMouseLeave() {
    if (this.isVideoPlaying) {
      this.startHideControlsTimer();
    }
  }

  private startHideControlsTimer() {
    this.clearHideControlsTimer();
    this.seekControlsTimeout = setTimeout(() => this.showSeekControls = false, 500);
  }

  private clearHideControlsTimer(): void {
    if (this.seekControlsTimeout) {
      clearTimeout(this.seekControlsTimeout);
    }
  }

  private startProgressUpdater() {
    this.stopProgressUpdater();
    this.progressUpdateTimer = setInterval(() => {
      this.updateCurrentProgress(false);
    }, this.UPDATE_INTERVAL);
  }

  private stopProgressUpdater() {
    if (this.progressUpdateTimer) {
      clearInterval(this.progressUpdateTimer);
    }
  }

  private updateCurrentProgress(isFinished: boolean) {
    if (!this.movie || !this.videoPlayer) return;
    if(!this.authService.isLoggedIn()) return;

    const video = this.videoPlayer.nativeElement;
    const currentTime = isFinished ? video.duration : video.currentTime;

    if (currentTime > 1) {
      this.movieService.updateWatchProgress(this.movie.id, currentTime, isFinished).subscribe({
        error: err => ("")
      })
    }
  }

  scrollToComments(element: HTMLElement): void {
    element.scrollIntoView({behavior: 'smooth', block: 'start'});
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (!this.videoPlayer || !this.videoPlayer.nativeElement) {
      return;
    }
    const target = event.target as HTMLElement;
    const tagName = target.tagName.toLowerCase();
    if (tagName === 'input' || tagName === 'textarea') {
      return;
    }
    const video = this.videoPlayer.nativeElement;
    switch (event.key) {
      case ' ':
        event.preventDefault();
        video.paused ? video.play() : video.pause();
        break;
      case 'ArrowRight':
        event.preventDefault();
        this.seekVideo(5);
        break;
      case 'ArrowLeft':
        event.preventDefault();
        this.seekVideo(-5);
        break;
    }
  }

  private formatTime(totalSeconds: number): string {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
}
