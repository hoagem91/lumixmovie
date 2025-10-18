import {
  Component,
  HostListener,
  Input,
  OnChanges,
  OnInit,
  OnDestroy,
  SimpleChanges
} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {MovieService} from "../../services/movie.service";
import {AuthService} from "../../services/auth.service";
import {NotificationService} from "../../services/notification.service";
import {CommentModel} from "../../models/comment.model";
import {CommentService} from "../../services/comment.service";
import {interval, Subscription} from "rxjs";

@Component({
  selector: 'app-comment-section',
  templateUrl: './comment-section.component.html',
  styleUrls: ['./comment-section.component.scss']
})
export class CommentSectionComponent implements OnInit, OnChanges, OnDestroy {
  @Input() movieId!: string;
  comments: CommentModel[] = [];
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
  replyingToCommentId: string | null = null;

  expandedComments: { [key: string]: boolean } = {};
  replyContent = '';
  isSending = false;

  pollingSub?: Subscription;

  /** 👇 Bộ nhớ tạm lưu ID comment mới để highlight */
  newCommentIds = new Set<string>();

  constructor(
    private fb: FormBuilder,
    private movieService: MovieService,
    private commentService: CommentService,
    public authService: AuthService,
    private notification: NotificationService
  ) {
    this.commentForm = this.fb.group({
      content: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  ngOnInit(): void {
    this.loadComments();
    this.pollingSub = interval(30000).subscribe(() => {
      this.loadComments(false);
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['movieId'] && changes['movieId'].currentValue) {
      const newId = changes['movieId'].currentValue;
      const oldId = changes['movieId'].previousValue;
      if (newId !== oldId) {
        this.loadComments();
      }
    }
  }

  ngOnDestroy() {
    this.pollingSub?.unsubscribe();
  }

  /** ✅ Tải comment từ API và đánh dấu comment mới */
  loadComments(showLoading: boolean = true) {
    if (showLoading) this.loading = true;

    this.movieService.getCommentsForMovie(this.movieId).subscribe({
      next: (data) => {
        const newComments = data.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        // Cập nhật hoặc thêm mới comment gốc
        newComments.forEach(newCmt => {
          const existing = this.comments.find(c => c.id === newCmt.id);
          if (existing) {
            // cập nhật nội dung gốc
            if (
              existing.content !== newCmt.content ||
              existing.likeCount !== newCmt.likeCount ||
              existing.dislikeCount !== newCmt.dislikeCount
            ) {
              Object.assign(existing, newCmt);
            }

            // ✅ Cập nhật phần reply bên trong
            this.syncReplies(existing, newCmt);
          } else {
            // ✅ Comment mới
            this.comments.unshift(newCmt);
            this.highlightNewComment(newCmt.id);
          }
        });

        // Xóa comment gốc đã bị xóa
        this.comments = this.comments.filter(c =>
          newComments.some(nc => nc.id === c.id)
        );

        this.loading = false;
      },
      error: (err) => {
        this.error = "Không thể tải bình luận. Vui lòng thử lại.";
        console.error(err);
        this.loading = false;
      }
    });
  }

  /** ✅ Hàm đồng bộ phần reply */
  private syncReplies(existing: CommentModel, newCmt: CommentModel) {
    if (!newCmt.replies) return;

    if (!existing.replies) existing.replies = [];

    newCmt.replies.forEach(newReply => {
      const existingReply = existing.replies!.find(r => r.id === newReply.id);
      if (existingReply) {
        if (
          existingReply.content !== newReply.content ||
          existingReply.likeCount !== newReply.likeCount ||
          existingReply.dislikeCount !== newReply.dislikeCount
        ) {
          Object.assign(existingReply, newReply);
        }
      } else {
        existing.replies!.push(newReply);
        this.highlightNewComment(newReply.id);
      }
    });

    // Xóa reply không còn tồn tại
    existing.replies = existing.replies.filter(r =>
      newCmt.replies!.some(nr => nr.id === r.id)
    );
  }


  /** ✅ Đánh dấu và tự động bỏ highlight sau vài giây */
  private highlightNewComment(commentId: string) {
    this.newCommentIds.add(commentId);
    setTimeout(() => this.newCommentIds.delete(commentId), 3000);
  }

  /** ✅ Gửi bình luận mới */
  onSubmit(): void {
    if (this.commentForm.invalid || this.isSubmitting) return;
    if (!this.authService.isLoggedIn()) {
      this.notification.show("Vui lòng đăng nhập để bình luận", 'warning');
      return;
    }
    this.isSubmitting = true;
    const content = this.commentForm.value.content;

    this.movieService.postComment(this.movieId, content).subscribe({
      next: (newComment) => {
        this.comments.unshift(newComment);
        this.highlightNewComment(newComment.id);
        this.commentForm.reset();
        this.isSubmitting = false;
      },
      error: () => {
        this.error = "Không thể gửi bình luận. Vui lòng thử lại.";
        this.isSubmitting = false;
      }
    });
  }

  /** ✅ Các phần còn lại giữ nguyên logic cũ */
  startEdit(comment: CommentModel) {
    this.editingCommentId = comment.id;
    this.editingContent = comment.content;
  }

  cancelEdit() {
    this.editingCommentId = null;
    this.editingContent = '';
  }

  saveUpdate() {
    if (!this.editingCommentId || this.editingContent.trim().length < 3) {
      this.notification.show("Nội dung bình luận phải có ít nhất 3 ký tự", 'warning');
      return;
    }
    if (!this.authService.isLoggedIn()) {
      this.notification.show("Vui lòng đăng nhập để sửa bình luận", 'warning');
      return;
    }
    this.isUpdating = true;
    this.movieService.updateComment(this.movieId, this.editingCommentId, this.editingContent).subscribe({
      next: (updateComment) => {
        const index = this.comments.findIndex(c => c.id === updateComment.id);
        if (index !== -1) {
          this.comments[index] = updateComment;
          this.highlightNewComment(updateComment.id);
        }
        this.notification.show("Cập nhật bình luận thành công", 'success');
        this.cancelEdit();
      },
      error: () => {
        this.notification.show("Cập nhật bình luận thất bại", 'error');
      },
      complete: () => this.isUpdating = false
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
        this.loadComments(false);
      },
      error: () => {
        this.isDeleteComment = false;
        this.notification.show("Xóa bình luận thất bại hoặc bạn không được phép!", 'error');
      }
    });
  }

  toggleCommentMenu(commentId: string, event: MouseEvent) {
    event.stopPropagation();
    this.openMenuCommentId = this.openMenuCommentId === commentId ? null : commentId;
  }

  toggleReply(commentId: string) {
    this.replyingToCommentId = this.replyingToCommentId === commentId ? null : commentId;
    this.replyContent = '';
  }

  toggleReplies(commentId: string) {
    this.expandedComments[commentId] = !this.expandedComments[commentId];
  }

  cancelReply() {
    this.replyingToCommentId = null;
    this.replyContent = '';
  }

  sendReply(parentId: string) {
    if (!this.replyContent.trim()) return;
    this.isSending = true;
    this.movieService.postComment(this.movieId, this.replyContent, parentId).subscribe({
      next: (res) => {
        const reply = res;
        const parentComment = this.comments.find(c => c.id === parentId);
        if (parentComment) {
          if (!parentComment.replies) parentComment.replies = [];
          parentComment.replies.push(reply);
          this.expandedComments[parentId] = true;
          this.highlightNewComment(reply.id);
        }
        this.isSending = false;
        this.cancelReply();
      },
      error: () => {
        this.isSending = false;
      }
    });
  }

  toggleLike(commentId: string) {
    if (!this.authService.isLoggedIn()) {
      this.notification.show("Vui lòng đăng nhập để bày tỏ cảm xúc", 'warning');
      return;
    }

    const comment = this.comments.find(c => c.id === commentId);
    if (!comment) return;

    const originalReaction = comment.userReaction;
    const originalLikeCount = comment.likeCount;
    const originalDislikeCount = comment.dislikeCount;

    if (comment.userReaction === 'LIKE') {
      // Bỏ like
      comment.userReaction = null;
      comment.likeCount--;
    } else {
      // Thêm like
      if (comment.userReaction === 'DISLIKE') {
        comment.dislikeCount--; // Bỏ dislike cũ
      }
      comment.userReaction = 'LIKE';
      comment.likeCount++;
    }

    this.commentService.addLikeComment(commentId).subscribe({
      error: (err) => {
        if (comment) {
          comment.userReaction = originalReaction;
          comment.likeCount = originalLikeCount;
          comment.dislikeCount = originalDislikeCount;
        }
        console.error(err);
        this.notification.show("Có lỗi khi gửi phản ứng!", 'error');
      }
    });
  }

  toggleDislike(commentId: string) {
    if (!this.authService.isLoggedIn()) {
      this.notification.show("Vui lòng đăng nhập để bày tỏ cảm xúc", 'warning');
      return;
    }

    const comment = this.comments.find(c => c.id === commentId);
    if (!comment) return;

    const originalReaction = comment.userReaction;
    const originalLikeCount = comment.likeCount;
    const originalDislikeCount = comment.dislikeCount;

    if (comment.userReaction === 'DISLIKE') {
      // Bỏ dislike
      comment.userReaction = null;
      comment.dislikeCount--;
    } else {
      if (comment.userReaction === 'LIKE') {
        comment.likeCount--;
      }
      comment.userReaction = 'DISLIKE';
      comment.dislikeCount++;
    }

    this.commentService.addDislikeComment(commentId).subscribe({
      error: (err) => {
        if (comment) {
          comment.userReaction = originalReaction;
          comment.likeCount = originalLikeCount;
          comment.dislikeCount = originalDislikeCount;
        }
        console.error(err);
        this.notification.show("Có lỗi khi gửi phản ứng!", 'error');
      }
    });
  }

  trackByCommentId(index: number, comment: CommentModel) {
    return comment.id;
  }
  handleNewReply(reply: CommentModel, parentId: string) {
    const parent = this.comments.find(c => c.id === parentId);
    if (parent) {
      if (!parent.replies) parent.replies = [];
      parent.replies.push(reply);
    }
    this.replyingToCommentId = null;
  }

  @HostListener('document:click', ['$event'])
  onClickOutSide() {
    if (this.openMenuCommentId) {
      this.openMenuCommentId = null;
    }
  }
}
