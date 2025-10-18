import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MovieService} from "../../../services/movie.service";
import {FormControl} from "@angular/forms";
import {debounceTime, distinctUntilChanged, forkJoin, of, Subject, switchMap} from "rxjs";
import {map, takeUntil} from "rxjs/operators";
import {Movie} from "../../../models/movie.model";
import {NotificationService} from "../../../services/notification.service";

@Component({
  selector: 'app-movie-delete',
  templateUrl: './movie-delete.component.html',
  styleUrls: ['./movie-delete.component.scss']
})
export class MovieDeleteComponent implements OnInit, OnDestroy {
  isSearching = false;
  isPromptVisible = false;
  promptTitle = '';
  promptMessage = '';
  searchResults: any[] = [];
  searchQuery = new FormControl();
  private movieToDelete: { id: string, title: string } | null = null;
  private destroy$ = new Subject<void>();

  constructor(private movieService: MovieService, private notification: NotificationService) {
  }

  ngOnInit(): void {
    this.checkValueChange();
  }

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
          return of([])
        }
      })
    ).subscribe(result => {
        this.isSearching = false
        this.searchResults = result
      }
    )
  }
  askForDeleteConfirmation(movieId:string,movieTitle:string){
    this.movieToDelete = {id:movieId,title:movieTitle}
    this.promptTitle = "Xác nhận xoá phim"
    this.promptMessage = `Bạn có chắc chắn muốn xoá phim ${movieTitle} không?`;
    this.isPromptVisible = true;
  }
  confirmDelete() {
    if(!this.movieToDelete) return;
    this.movieService.deleteMovie(this.movieToDelete.id).subscribe({
      next: () => {
        this.notification.show(`Đã xoá phim ${this.movieToDelete?.title} thành công`, 'success')
        this.searchResults = this.searchResults.filter(movie => movie.id !== this.movieToDelete?.id)
      },
      error: (err) => {
        this.notification.show("Xóa phim thất bại", 'error');
      }
    })
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
