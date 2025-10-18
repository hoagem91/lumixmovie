import {Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {AuthService} from '../../services/auth.service';
import {Router} from '@angular/router';
import {debounceTime, distinctUntilChanged, forkJoin, of, Subject, Subscription, switchMap} from "rxjs";
import {MovieService} from "../../services/movie.service";
import {map, takeUntil} from "rxjs/operators";
import {Movie} from "../../models/movie.model";
import {FormControl} from "@angular/forms";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  isLoggedIn = false;
  isMenuOpen = false;
  isSearchActive = false;
  isSearching = false;
  searchQuery = new FormControl();
  searchResults: Movie[] = [];
  isProfileMenuOpen = false;
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();
  @ViewChild('searchContainer') searchContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('userMenuContainer') userMenuContainer!: ElementRef;

  constructor(
    public movieService: MovieService,
    private authService: AuthService,
    private router: Router
  ) {
  }

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.checkValueChange();
  };

  checkValueChange() {
    this.searchQuery.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$),
      switchMap(query => {
          if (query.length > 1) {
            this.isSearching = true;
            return forkJoin([
              this.movieService.searchMovie(query),
              this.movieService.findMoviesByGenres(query)
            ]).pipe(
              map(([resultsByTitle, resultsByGenre]) => {
                const combinedResults = [...resultsByTitle, ...resultsByGenre];
                const uniqueMovies = new Map<string, Movie>();
                combinedResults.forEach(movie => uniqueMovies.set(movie.id, movie));
                return Array.from(uniqueMovies.values());
              })
            );
          } else {
            this.searchResults = [];
            return of([]);
          }
        }
      )).subscribe(results => {
      this.isSearching = false;
      this.searchResults = results;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('document:click', ['$event'])
  clickout(event: Event) {
    if (this.isSearchActive && !this.searchContainer.nativeElement.contains(event.target as Node)) {
      this.closeSearch();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (this.isProfileMenuOpen && this.userMenuContainer && !this.userMenuContainer.nativeElement.contains(event.target as Node)) {
      this.isProfileMenuOpen = false;
    }
  }

  toggleProfileMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }

  logout(): void {
    this.authService.logout();
  }

  toggleSearch() {
    this.isSearchActive = !this.isSearchActive;
    if (!this.isSearchActive) {
      this.closeSearch();
    }
  }

  onSearchInput(event: Event): void {
    const query = (event.target as HTMLInputElement).value;
    this.searchSubject.next(query);
  }

  navigateToMovie(movieId: string): void {
    this.router.navigate(['/movies', movieId]);
    this.closeSearch();
  }

  private closeSearch(): void {
    this.isSearchActive = false;
    this.searchResults = [];
    this.isSearching = false;
    this.searchQuery.setValue(null);
  }

  // Phương thức này đảm bảo menu sẽ đóng lại sau khi logout
  logoutAndCloseMenu(): void {
    this.logout(); // Giả sử bạn đã có hàm logout()
    this.closeMenu();
  }
}
