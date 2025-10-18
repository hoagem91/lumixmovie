import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NotificationService } from '../../../services/notification.service';
import { MovieService } from "../../../services/movie.service";
import { Genre, Movie } from "../../../models/movie.model";

@Component({
  selector: 'app-genre-management',
  templateUrl: './genre-management.component.html',
  styleUrls: ['./genre-management.component.scss']
})
export class GenreManagementComponent implements OnInit {
  genres: Genre[] = [];
  movieCounts: { [genreId: string]: number } = {};
  isLoading = true;
  error: string | null = null;

  isModalOpen = false;
  isEditing = false;
  isSubmitting = false;
  genreForm!: FormGroup;
  currentGenreId: string | null = null;

  isDeleteConfirmVisible = false;
  genreToDelete: Genre | null = null;

  constructor(
    private fb: FormBuilder,
    private movieService: MovieService,
    private notification: NotificationService
  ) {
    this.genreForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]]
    });
  }

  ngOnInit(): void {
    this.loadGenres();
  }

  loadGenres(): void {
    this.isLoading = true;
    this.error = null;
    this.movieService.getAllGenre().subscribe({
      next: (data) => {
        this.genres = data;
        this.isLoading = false;
        this.loadAllMovieCounts();
      },
      error: (err) => {
        this.error = 'Không thể tải danh sách thể loại. Vui lòng thử lại.';
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  loadAllMovieCounts(): void {
    this.genres.forEach((genre) => {
      this.movieService.getMoviesByGenre(genre.name).subscribe({
        next: (movies: Movie[]) => {
          this.movieCounts[genre.id] = movies.length;
        },
        error: (err) => {
          console.error(`Lỗi khi lấy phim cho thể loại ${genre.name}:`, err);
          this.movieCounts[genre.id] = 0;
        }
      });
    });
  }

  openGenreModal(genre?: Genre): void {
    if (genre) {
      this.isEditing = true;
      this.currentGenreId = genre.id;
      this.genreForm.setValue({ name: genre.name });
    } else {
      this.isEditing = false;
      this.currentGenreId = null;
      this.genreForm.reset();
    }
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  saveGenre(): void {
    if (this.genreForm.invalid) return;

    this.isSubmitting = true;
    const genreData = this.genreForm.value;
    const operation = this.isEditing && this.currentGenreId
      ? this.movieService.updateGenre(this.currentGenreId, genreData)
      : this.movieService.createGenre(genreData);

    operation.subscribe({
      next: () => {
        this.notification.show(
          this.isEditing ? 'Cập nhật thể loại thành công!' : 'Thêm thể loại thành công!',
          'success'
        );
        this.isSubmitting = false;
        this.closeModal();
        this.loadGenres();
      },
      error: (err) => {
        this.notification.show('Đã xảy ra lỗi. Vui lòng thử lại.', 'error');
        this.isSubmitting = false;
        console.error(err);
      }
    });
  }

  confirmDelete(genre: Genre): void {
    this.genreToDelete = genre;
    this.isDeleteConfirmVisible = true;
  }

  deleteGenre(): void {
    if (!this.genreToDelete) return;

    this.movieService.deleteGenre(this.genreToDelete.id).subscribe({
      next: () => {
        this.notification.show('Xóa thể loại thành công!', 'success');
        this.isDeleteConfirmVisible = false;
        this.genreToDelete = null;
        this.loadGenres();
      },
      error: (err) => {
        this.notification.show('Xóa thất bại. Thể loại có thể đang được sử dụng.', 'error');
        this.isDeleteConfirmVisible = false;
        console.error(err);
      }
    });
  }
}
