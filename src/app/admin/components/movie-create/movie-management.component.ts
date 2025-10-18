import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {FileUploadService} from "../../../services/file-upload.service";
import {NotificationService} from "../../../services/notification.service";
import {finalize} from "rxjs/operators";
import {MovieService} from "../../../services/movie.service";

@Component({
  selector: 'app-movie-create',
  templateUrl: './movie-management.component.html',
  styleUrls: ['./movie-management.component.scss']
})
export class MovieManagementComponent implements OnInit {
  movieForm!: FormGroup;
  selectedVideoFile: File | null = null;
  videoUploadProgress = 0;
  isUploadingVideo = false;
  selectedPosterFile: File | null = null;
  posterUploadProgress = 0;
  isUploadingPoster = false;
  posterPreview: string | ArrayBuffer | null = null;
  isSubmitting = false;
  isVisible = false;
  promptTitle = '';
  promptMessage = '';

  constructor(private fb: FormBuilder, private fileUploadService: FileUploadService, private movieService: MovieService, private notification: NotificationService) {
    this.movieForm = this.fb.group({
      title: ['', Validators.required],
      genre: [''],
      duration: [''],
      releaseDate: [''],
      description: [''],
      videoUrl: ['', Validators.required],
      posterUrl: ['', Validators.required]
    })
  }

  ngOnInit(): void {
  }

  onVideoSelected(event: Event) {
    const element = event.currentTarget as HTMLInputElement;
    const file = element.files?.[0];
    if (file) {
      this.selectedVideoFile = file;
      this.videoUploadProgress = 0;
      this.movieForm.patchValue({videoUrl: ''});
    }
  }

  onPosterSelected(event: Event) {
    const element = event.currentTarget as HTMLInputElement;
    const file = element.files?.[0];
    if (file) {
      this.selectedPosterFile = file;
      this.posterUploadProgress = 0;
      this.movieForm.patchValue({posterUrl: ''});

      const reader = new FileReader();
      reader.onload = () => this.posterPreview = reader.result;
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
        if (event) {
          this.videoUploadProgress = event.progress;
          if (event.url) {
            this.movieForm.patchValue({videoUrl: event.url})
            this.notification.show("Tải video thành công!", 'success');
          }
        }
      },
      error: (err) => {
        this.notification.show("Tải video thất bại!", 'error');
        this.videoUploadProgress = 0;
      }
    })
  }

  uploadPoster() {
    if (!this.selectedPosterFile) return;
    this.isUploadingPoster = true;
    this.fileUploadService.upload(this.selectedPosterFile, 'image').pipe(
      finalize(() => this.isUploadingPoster = false)
    ).subscribe({
      next: (event) => {
        if (event) {
          this.posterUploadProgress = event.progress;
          if (event.url) {
            this.movieForm.patchValue(({posterUrl: event.url}))
            this.notification.show("Tải poster thành công!", "success")
          }
        }
      },
      error: (err) => {
        this.notification.show("Tải poster thất bại!", "error")
        this.posterUploadProgress = 0;
      }
    });
  }
  askForCreateConfirmation(){
    if (this.movieForm.invalid) {
      this.notification.show("Vui lòng điền đầy đủ thông tin!", "error")
      return;
    }
    this.promptTitle = 'Xác nhận'
    this.promptMessage = `Bạn có chắc chắn muốn tạo phim ${this.movieForm.get('title')?.value} không?`
    this.isVisible = true
  }
  onSubmit() {
    if (this.movieForm.invalid) {
      this.notification.show("Vui lòng điền đầy đủ thông tin!", "error")
      return;
    }
    this.isSubmitting = true;
    this.movieService.createMovie(this.movieForm.value).pipe(
      finalize(() => this.isSubmitting = false)
    ).subscribe({
      next:(newMovie)=>{
        this.notification.show(`Phim ${newMovie.title} đã được tạo thành công!`,'success')
        this.resetForm();
      },
      error:(err)=>{
        this.notification.show("Tạo phim thất bại!",'error')
      }
    })
  }

  resetForm() {
    this.movieForm.reset();
    this.selectedVideoFile = null;
    this.selectedPosterFile = null;
    this.videoUploadProgress = 0;
    this.posterUploadProgress = 0;
    this.posterPreview = null;
  }
}
