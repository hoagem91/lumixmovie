import {Component, Input, OnInit} from '@angular/core';
import {Movie} from "../../models/movie.model";
import {Router} from "@angular/router";

@Component({
  selector: 'app-top-movies',
  templateUrl: './top-movies.component.html',
  styleUrls: ['./top-movies.component.scss']
})
export class TopMoviesComponent implements OnInit {
  @Input() movies: Movie[] = [];
  @Input() title: string | null = null;

  constructor(private router:Router) {
  }

  ngOnInit(): void {
  }

  onMovieClick(movie: Movie) {
    this.router.navigate([`/movies/${movie.id}`]);
  }
}
