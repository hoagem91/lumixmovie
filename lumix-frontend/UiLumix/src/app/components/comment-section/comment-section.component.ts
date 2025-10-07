import {Component, HostListener, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {MovieService} from "../../services/movie.service";
import {AuthService} from "../../services/auth.service";
import {NotificationService} from "../../services/notification.service";
import {CommentModel} from "../../models/comment.model";
import {CommentService} from "../../services/comment.service";

@Component({
  selector: 'app-comment-section',
  templateUrl: './comment-section.component.html',
  styleUrls: ['./comment-section.component.scss']
})
export class CommentSectionComponent implements OnInit, OnChanges {
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

  likeCounts: Record<string, number> = {};
  dislikeCounts: Record<string, number> = {};

  expandedComments: { [key: string]: boolean } = {};
  replyContent = '';
  isSending = false;

  constructor(
    private fb: FormBuilder,
    private commentService: CommentService,
    private movieService: MovieService,
    public authService: AuthService,
    private notification: NotificationService
  ) {
    this.commentForm = this.fb.group({
      content: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['movieId'] && changes['movieId'].currentValue) {
      if (changes['movieId'].currentValue !== changes['movieId'].previousValue) {
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

        // ✅ Gọi API đếm like/dislike 1 lần cho mỗi bình luận
        this.comments.forEach(c => {
          this.commentService.getReactionLikeCounts(c.id).subscribe(count => {
            this.likeCounts[c.id] = count;
          });
          this.commentService.getReactionDislikeCounts(c.id).subscribe(count => {
            this.dislikeCounts[c.id] = count;
          });
        });
      },
      error: (err) => {
        this.error = "Không thể tải bình luận. Vui lòng thử lại.";
        this.loading = false;
        console.error(err);
      }
    });
  }

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
        }
        this.isSending = false;
        this.cancelReply();
      },
      error: () => {
        this.isSending = false;
      }
    })
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
