import {Component, Input, OnInit} from '@angular/core';
import {Movie} from "../../models/movie.model";
import {ActivatedRoute, Router} from "@angular/router";
import {MovieService} from "../../services/movie.service";
import {switchMap} from "rxjs";
import {Category} from "../../models/category.model";

@Component({
  selector: 'app-movie-grid',
  templateUrl: './movie-grid.component.html',
  styleUrls: ['./movie-grid.component.scss']
})
export class MovieGridComponent implements OnInit {
  movies: Movie[] = [];
  categoryTitle: string = "";

  constructor(private router: Router, private movieService: MovieService, private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.loadMoviesByTitle();
  }

  loadMoviesByTitle() {
    this.route.paramMap.pipe(
      switchMap((params) => {
        const slug = params.get('slug');
        this.categoryTitle = slug || '';
        if(!slug) return [];
        switch (slug) {
          case "Trending":
            return this.movieService.getTrendingMovies();
          case "Phổ biến":
            return this.movieService.getPopularMovies();
          case "Tình cảm":
            return this.movieService.getMoviesByGenreName('Tinh cam');
          case "Hành động":
            return this.movieService.getMoviesByGenreName('hanh dong');
          case "Hài hước":
            return this.movieService.getMoviesByGenreName('hai');
          case "Hoạt hình":
            return this.movieService.getMoviesByGenreName('hoat hinh');
          default:
            return this.movieService.getMoviesByGenreName(slug);
        }
      })
    ).subscribe(movies => this.movies = movies);
  }

  onMovieClick(movie: Movie) {
    this.router.navigate([`/movies/${movie.id}`]);
  }
}
