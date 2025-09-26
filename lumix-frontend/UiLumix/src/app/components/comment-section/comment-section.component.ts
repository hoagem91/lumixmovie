import {Component, HostListener, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {Comment} from "../../models/movie.model";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {MovieService} from "../../services/movie.service";
import {AuthService} from "../../services/auth.service";
import {NotificationService} from "../../services/notification.service";

@Component({
  selector: 'app-comment-section',
  templateUrl: './comment-section.component.html',
  styleUrls: ['./comment-section.component.scss']
})
export class CommentSectionComponent implements OnInit, OnChanges {
  @Input() movieId!: string;
  comments: Comment[] = [];
  commentForm!: FormGroup;
  loading = true;
  error: string | null = null;
  isSubmitting = false;
  isUpdating = false;
  isVisiable = false;
  promptTitle = '';
  promptMessage = '';
  commentToDelete: string | null = null;
  isDeleteComment = false;
  editingCommentId: string | null = null;
  editingContent = '';
  openMenuCommentId: string | null = null;

  constructor(private fb: FormBuilder, private movieService: MovieService, public authService: AuthService, private notification: NotificationService) {
    this.commentForm = this.fb.group({
      content: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  ngOnInit(): void {

  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['movieId'] && changes['movieId'].currentValue) {
      if (changes['movieId'].currentValue != changes['movieId'].previousValue) {
        this.loadComments();
      }
    }
  }

  loadComments() {
    this.loading = true;
    this.movieService.getCommentsForMovie(this.movieId).subscribe({
      next: (data) => {
        this.comments = data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        this.loading = false;
      },
      error: (err) => {
        this.error = "Không thể tải bình luận. Vui lòng thử lại.";
        this.loading = false;
        console.error(err);
      }
    })
  }

  startEdit(comment: Comment) {
    this.editingCommentId = comment.id;
    this.editingContent = comment.content;
  }

  cancelEdit() {
    this.editingCommentId = null;
    this.editingContent = '';
  }

  saveUpdate() {
    if (!this.editingCommentId || this.editingContent.trim().length < 3) {
      this.notification.show("Nội dung bình luận phải có ít nhất 3 ký tự", 'warning')
      return;
    }
    if (!this.authService.isLoggedIn()) {
      this.notification.show("Vui lòng đăng nhập để sửa bình luận", 'warning');
      return;
    }
    this.isUpdating = true;
    this.movieService.updateComment(this.movieId, this.editingCommentId, this.editingContent).subscribe({
      next: (updateComment) => {
        const index = this.comments.findIndex(c => c.id === updateComment.id)
        if (index !== -1) {
          this.comments[index] = updateComment;
        }
        this.notification.show("Cập nhật bình luận thành công", 'success');
        this.cancelEdit();
      },
      error: (err) => {
        this.notification.show("Cập nhật bình luận thất bại", 'error');
      },
      complete: () => this.isUpdating = false
    })
  }

  onSubmit(): void {
    if (this.commentForm.invalid || this.isSubmitting) {
      return;
    }
    if (!this.authService.isLoggedIn()) {
      this.notification.show("Vui lòng đăng nhập để bình luận", 'warning');
      return;
    }
    this.isSubmitting = true;
    const content = this.commentForm.value.content;
    this.movieService.postComment(this.movieId, content).subscribe({
      next: (newComment) => {
        this.comments.unshift(newComment);
        this.commentForm.reset();
        this.isSubmitting = false;
      },
      error: () => {
        this.error = "Không thể gửi bình luận. Vui lòng thử lại.";
        this.isSubmitting = false;
      }
    });
  }

  askForDeleteConfirm(commentId: string) {
    this.commentToDelete = commentId;
    this.isVisiable = true;
    this.promptMessage = 'Bạn có muốn xóa bình luận này không!';
    this.promptTitle = 'Xác nhận';
  }

  deleteComment() {
    const userId = this.authService.getUserId();
    if (!userId || !this.movieId || !this.commentToDelete || this.isDeleteComment) return;
    this.isDeleteComment = true;
    this.movieService.deleteComment(this.movieId, this.commentToDelete).subscribe({
      next: () => {
        this.isDeleteComment = false;
        this.notification.show("Đã xóa bình luận thành công!", 'success');
        this.openMenuCommentId = null;
        this.loadComments();
      },
      error: () => {
        this.isDeleteComment = false;
        this.notification.show("Xóa bình luận thất bại" || "Bạn không được phép xóa hoặc sửa bình luận!", 'error');
      }
    })
  }

  toggleCommentMenu(commentId: string, event: MouseEvent) {
    event.stopPropagation();
    if (this.openMenuCommentId === commentId) {
      this.openMenuCommentId = null;
    } else {
      this.openMenuCommentId = commentId;
    }
  }

  @HostListener('document:click', ['$event'])
  onClickOutSide(event: Event) {
    if (this.openMenuCommentId) {
      this.openMenuCommentId = null;
    }
  }
}
