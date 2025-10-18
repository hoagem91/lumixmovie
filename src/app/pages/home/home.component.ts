// 1. Import HostListener để xử lý responsive
import {Component, HostListener, OnDestroy, OnInit} from '@angular/core';
import {MovieService} from "../../services/movie.service";
import {Genre, Movie, WatchHistory} from '../../models/movie.model';
import {animate, query, stagger, style, transition, trigger} from "@angular/animations";
import {forkJoin, of, switchMap} from "rxjs";
import {catchError, map} from "rxjs/operators";
import {Router} from "@angular/router";
import {NotificationService} from "../../services/notification.service";
import {AuthService} from "../../services/auth.service";

// 2. ĐÃ XÓA: Dòng import {error} không chính xác đã được loại bỏ

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  animations: [
    // ... animations của bạn được giữ nguyên
    trigger('slideAnimation', [
      transition('* => *', [
        query(':enter', [
          style({opacity: 0, transform: 'translateX(50px)'}),
          stagger('100ms', [
            animate('300ms ease-out', style({opacity: 1, transform: 'none'}))
          ])
        ], {optional: true}),
        query(':leave', [
          animate('20ms ease-in', style({opacity: 0, transform: 'translateX(-50px)'}))
        ], {optional: true})
      ])
    ])
  ]
})
export class HomeComponent implements OnInit, OnDestroy {
  genres: Genre[] = [];
  movies: Movie[] = [];
  backgroundMovies: Movie[] = [];
  historyItems: WatchHistory[] = [];
  loading = false;
  error: string | null = null;
  currentCategoryIndex = 0;
  slideInterval: any;
  maxCategoriesVisible = 4;

  @HostListener('window:resize', ['$event'])
  onResize(event?: Event) {
    this.updateVisibleCategories();
    this.updateBackgroundMovies();
  }

  constructor(private movieService: MovieService, private router: Router, private notification: NotificationService, private authService: AuthService) {
  }

  ngOnInit(): void {
    this.updateVisibleCategories();
    this.loadInitialData();
    this.loadHistory();
  }

  ngOnDestroy(): void {
    if (this.slideInterval) {
      clearInterval(this.slideInterval);
    }
  }

  public loadInitialData() {
    this.loading = true;
    this.error = null;

    // Tải danh sách phim cho hero section và grid nền
    this.movieService.getAllMovies().subscribe({
      next: (data) => {
        this.movies = data;
        this.updateBackgroundMovies();
      },
      error: (err) => {
        this.error = "Không thể tải danh sách phim.";
        this.loading = false;
        console.error(err);
      }
    });

    // Tải danh sách thể loại và phim tương ứng
    this.movieService.getAllGenre().pipe(
      switchMap(genres => {
        if (!genres || genres.length === 0) return of([]);
        const movieRequests = genres.map(genre =>
          this.movieService.getMoviesByGenre(genre.name).pipe(
            map(movies => ({...genre, movies})),
            catchError(() => of({...genre, movies: []}))
          )
        );
        return forkJoin(movieRequests);
      })
    ).subscribe({
      next: (genresWithMovies) => {
        this.genres = genresWithMovies.filter(g => g.movies && g.movies.length >= 4);
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Không thể tải danh sách thể loại.';
        this.loading = false;
        console.error('Error loading genres:', err);
      }
    });
  }

  loadHistory() {
    this.loading = true;
    this.error = null;
    if (this.authService.isLoggedIn()) {
      this.movieService.continueWatching().subscribe({
        next: (historyItems) => {
          this.historyItems = historyItems;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.notification.show("Không thể tải lịch sử xem của ban!", 'error');
        }
      })
    }
  }

  handleItemDelete(movieDeleteId: string) {
    this.historyItems = this.historyItems.filter(item => item.movie.id != movieDeleteId);
  }

  // --- Category Controls ---
  previousCategory(): void {
    if (this.currentCategoryIndex > 0) {
      this.currentCategoryIndex--;
    }
  }

  nextCategory(): void {
    if (this.currentCategoryIndex < this.genres.length - this.maxCategoriesVisible) {
      this.currentCategoryIndex++;
    }
  }

  viewCategory(category: Genre): void {
    this.router.navigate(["/category/",category.name])
  }

  private updateBackgroundMovies(): void {
    if (!this.movies || this.movies.length === 0) {
      return;
    }

    const screenWidth = window.innerWidth;
    let imageCount: number;

    if (screenWidth <= 768) {
      imageCount = 12;
    } else if (screenWidth <= 1200) {
      imageCount = 30;
    } else {
      imageCount = 50;
    }

    this.backgroundMovies = this.movies.slice(0, imageCount);
  }

  public updateVisibleCategories(): number {
    const screenWidth = window.innerWidth;
    if (screenWidth <= 768) {
      return this.maxCategoriesVisible = 2; // Mobile
    } else if (screenWidth <= 1024) {
      return this.maxCategoriesVisible = 3; // Tablet
    } else {
      return this.maxCategoriesVisible = 4; // Desktop
    }
  }
}
