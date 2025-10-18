import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from "@angular/core";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {CommentModel} from "../../../models/comment.model";
import {MovieService} from "../../../services/movie.service";
import {NotificationService} from "../../../services/notification.service";
import {finalize} from "rxjs/operators";

@Component({
  selector: "app-comment-update",
  templateUrl: "comment-update.component.html",
  styleUrls: ['comment-update.component.scss']
})
export class CommentUpdateComponent implements OnInit, OnChanges {
  @Input() commentToEdit: CommentModel | null = null;
  @Output() closeModal = new EventEmitter<void>();
  @Output() commentUpdate = new EventEmitter<CommentModel>();

  commentForm!: FormGroup;
  isUpdating = false;
  isEditMode = false;

  constructor(
    private fb: FormBuilder,
    private movieService: MovieService,
    private notification: NotificationService
  ) {
    this.commentForm = this.fb.group({
      content: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['commentToEdit'] && this.commentToEdit) {
      this.commentForm.patchValue({
        content: this.commentToEdit.content
      });
      this.isEditMode = false;
    }
  }

  onSave(): void {
    if (this.commentForm.invalid || !this.commentToEdit) {
      return;
    }
    this.isUpdating = true;
    const newContent = this.commentForm.value.content;

    this.movieService.updateCommentModal( this.commentToEdit.movieId,this.commentToEdit.id, newContent).pipe(
      finalize(() => this.isUpdating = false)
    ).subscribe({
      next: (updatedComment) => {
        this.notification.show("Cập nhật bình luận thành công!", 'success');
        this.isEditMode = false;
        console.log("update:{}",updatedComment)
        this.commentUpdate.emit(updatedComment);
      },
      error: () => {
        this.notification.show("Cập nhật bình luận thất bại.", 'error');
      }
    });
  }

  onCancel(): void {
    this.closeModal.emit();
  }
  cancelEdit(){
    this.isEditMode = false;
    this.commentForm.patchValue({content: this.commentForm.value.content});
  }
}
