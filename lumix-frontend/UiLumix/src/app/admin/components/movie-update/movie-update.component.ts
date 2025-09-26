import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {debounceTime, distinctUntilChanged, forkJoin, of, Subject, switchMap} from "rxjs";
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {finalize, map, takeUntil} from "rxjs/operators";
import {MovieService} from "../../../services/movie.service";
import {NotificationService} from "../../../services/notification.service";
import {Movie} from "../../../models/movie.model";
import {FileUploadService} from "../../../services/file-upload.service";
import {CanComponentDeactivate} from "../../../guards/unsaved-changes.guard";

@Component({
  selector: 'app-movie-update',
  templateUrl: './movie-update.component.html',
  styleUrls: ['./movie-update.component.scss']
})
export class MovieUpdateComponent implements OnInit, OnDestroy, CanComponentDeactivate {
  movieForm: FormGroup;
  selectedMovieForUpdate: Movie | null = null;
  isSearching = false;
  isPromptVisible = false;
  promptTitle = '';
  promptMessage = '';
  searchResults: any[] = [];
  selectedPosterFile: File | null = null;
  posterUploadProgress = 0;
  isUploadingPoster = false;
  posterPreview: string | ArrayBuffer | null = null;
  newPosterUrl: string | null = null;
  videoPreview: string | ArrayBuffer | null = null;
  newVideoUrl: string | null = null;
  isUploadingVideo = false;
  videoUploadProgress = 0;
  selectedVideoFile: File | null = null;
  searchQuery = new FormControl();
  movieToUpdate: { id: string, title: string } | null = null;
  private destroy$ = new Subject<void>();
  @ViewChild('posterInput') posterInput!: ElementRef<HTMLInputElement>;
  @ViewChild('videoInput') videoInput!: ElementRef<HTMLInputElement>;

  constructor(private movieService: MovieService, private notification: NotificationService, private fileUploadService: FileUploadService, private fb: FormBuilder) {
    this.movieForm = this.fb.group({
      title: [''],
      genres: [''],
      duration: [''],
      year: [''],
      description: [''],
      posterUrl: [''],
      videoUrl: ['']
    })
  }

  ngOnInit(): void {
    this.checkValueChanges();
  }

  checkValueChanges() {
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
              const combinedResult = [...resultsByTitle, ...resultsByGenre];
              const uniqueResult = new Map<string, Movie>();
              combinedResult.forEach(movie => uniqueResult.set(movie.id, movie));
              return Array.from(uniqueResult.values());
            })
          )
        } else {
          this.searchResults = [];
          return of([])
        }
      })
    ).subscribe(result => {
      this.isSearching = false;
      this.searchResults = result;
    })
  }

  toggleUpdateForm(movie: any) {
    if (this.hasUnsavedChanges()) {
      const discardChanges = confirm('Bạn có những thay đổi chưa được lưu. Bạn có chắc chắn muốn hủy bỏ chúng không?');
      if (!discardChanges) {
        return;
      }
    }
    this.selectedMovieForUpdate = movie;
    this.movieForm.reset();
    this.selectedPosterFile = null;
    this.posterPreview = null;
    this.newPosterUrl = null;
    this.posterUploadProgress = 0;
    this.selectedVideoFile = null;
    this.videoPreview = null;
    this.newVideoUrl = null;
    this.videoUploadProgress = 0;
    if (this.posterInput || this.videoInput) {
      this.posterInput.nativeElement.value = '';
      this.videoInput.nativeElement.value = '';
    }
    this.movieForm.patchValue({
      title: movie.title,
      genres: movie.genres,
      duration: movie.duration,
      year: movie.year,
      description: movie.description,
      posterUrl: movie.posterUrl,
      videoUrl: movie.videoUrl
    })
  }

  onPosterSelected(event: Event) {
    const element = event.currentTarget as HTMLInputElement;
    const file = element.files?.[0];
    if (file) {
      this.selectedPosterFile = file;
      this.posterPreview = null;
      this.posterUploadProgress = 0;

      const reader = new FileReader();
      reader.onload = () => this.posterPreview = reader.result;
      reader.readAsDataURL(file);
    }
  }

  uploadPoster() {
    if (!this.selectedPosterFile) return;
    this.isUploadingPoster = true;
    this.fileUploadService.upload(this.selectedPosterFile, 'image').pipe(
      finalize(() => this.isUploadingPoster = false)
    ).subscribe({
      next: (event) => {
        this.posterUploadProgress = event.progress;
        if (event.url) {
          this.movieForm.patchValue({posterUrl: event.url})
          this.newPosterUrl = event.url;
          this.notification.show("Tải poster thành công!", "success")
          this.selectedPosterFile = null;
          if (this.posterInput) {
            this.posterInput.nativeElement.value = '';
          }
          this.isUploadingPoster = false;
        }
      }, error: () => {
        this.notification.show("Tải poster thất bại!", "error")
        this.posterUploadProgress = 0;
        this.isUploadingPoster = false;
      }
    })
  }

  onVideoSelected(event: Event) {
    const element = event.currentTarget as HTMLInputElement;
    const file = element.files?.[0];
    if (file) {
      this.selectedVideoFile = file;
      this.videoPreview = null;
      this.videoUploadProgress = 0;
      const reader = new FileReader();
      reader.onload = () => this.videoPreview = reader.result;
      reader.readAsDataURL(file);
    }
  }

  uploadVideo() {
    if (!this.selectedVideoFile) return;
    this.isUploadingVideo = true;
    this.fileUploadService.upload(this.selectedVideoFile, 'video').pipe(
      finalize(() => this.isUploadingVideo = false)
    ).subscribe({
      next: (event) => {
        this.videoUploadProgress = event.progress;
        if (event.url) {
          this.movieForm.patchValue({videoUrl: event.url})
          this.newVideoUrl = event.url;
          this.notification.show("Tải video thành công!", "success");
          this.selectedVideoFile = null;
          if (this.videoInput) {
            this.videoInput.nativeElement.value = '';
          }
          this.isUploadingVideo = false;
        }
      }, error: () => {
        this.notification.show("Tải video thất bại!", "error");
        this.videoUploadProgress = 0;
      }
    })
  }

  askForUpdateConfirmation(movieId: string, title: string) {
    this.movieToUpdate = {id: movieId, title: title}
    this.isPromptVisible = true;
    this.promptTitle = 'Xác nhận'
    this.promptMessage = "Bạn có muốn lưu thay đổi của phim này không ?";
  }

  confirmUpdate() {
    if (!this.movieToUpdate) return;
    this.movieService.updateMovie(this.movieToUpdate.id, this.movieForm.value).subscribe({
      next: () => {
        this.notification.show(`Cập nhật phim ${this.movieToUpdate?.title} thành công!`, "success")
        this.searchResults = this.searchResults.filter(movie => movie.id !== this.movieToUpdate?.id);
        this.selectedMovieForUpdate = null;
        this.movieForm.reset();
        this.isPromptVisible = false;
      }, error: () => {
        this.notification.show(`Cập nhật phim ${this.movieToUpdate?.title} thất bại!`, "error")
      }
    })
  }

  hasUnsavedChanges(): boolean {
    return this.movieForm.dirty || this.selectedPosterFile !== null || this.selectedVideoFile !== null;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
