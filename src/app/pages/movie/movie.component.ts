import {Component, OnInit} from '@angular/core';
import {Genre, Movie} from "../../models/movie.model";
import {MovieService} from "../../services/movie.service";
import {forkJoin, of} from "rxjs";
import {catchError} from "rxjs/operators";
import {CommentModel} from "../../models/comment.model";

@Component({
  selector: 'app-movie',
  templateUrl: './movie.component.html',
  styleUrls: ['./movie.component.scss']
})
export class MovieComponent implements OnInit {
  ourGenres: Genre[] = [];
  releaseMovies: Movie[] = [];
  trendingMovies: Movie[] = [];
  romanticMovies: Movie[] = [];
  actionMovies: Movie[] = [];
  funnyMovies:Movie[]=[];
  cartoonMovies:Movie[]=[];
  popularMovies:Movie[]=[];
  proposeMovies:Movie[]=[];
  comments:CommentModel[]=[];
  loading = true;
  error: string | null = null;

  constructor(private movieService: MovieService) {
  }

  ngOnInit(): void {
    this.loadPageData();
  }

  loadPageData() {
    this.loading = true;
    this.error = null;
    forkJoin({
      movies: this.movieService.getAllMovies(),
      genres: this.movieService.getAllGenre(),
      trending:this.movieService.getTrendingMovies().pipe(catchError(()=>of([]))),
      romantic:this.movieService.getMoviesByGenreName('Tinh cam').pipe(catchError(()=>of([]))),
      action:this.movieService.getMoviesByGenreName('Hanh dong').pipe(catchError(()=>of([]))),
      funny:this.movieService.getMoviesByGenreName('Hai').pipe(catchError(()=>of([]))),
      cartoon:this.movieService.getMoviesByGenreName('Hoat hinh').pipe(catchError(()=>of([]))),
      popular:this.movieService.getPopularMovies().pipe(catchError(()=>of([]))),
      propose:this.movieService.getMoviesByGenreName('Phieu luu').pipe(catchError(()=>of([]))),
      release:this.movieService.getMoviesByGenreName('Chinh kich').pipe(catchError(()=>of([])))
    }).subscribe({
      next: (data) => {
        this.ourGenres = data.genres;
        this.trendingMovies = data.trending;
        this.romanticMovies = data.romantic;
        this.actionMovies = data.action;
        this.popularMovies = data.popular;
        this.funnyMovies = data.funny;
        this.cartoonMovies = data.cartoon;
        this.proposeMovies = data.propose;
        this.releaseMovies = data.release;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Không thể tải dữ liệu. Vui lòng thử lại sau.';
        this.loading = false;
        console.error('Lỗi khi tải dữ liệu trang phim:', err);
      }
    });
  }
}
