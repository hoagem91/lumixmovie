import { Component, EventEmitter, Input, Output } from '@angular/core';
import {CommentModel} from "../../models/comment.model";
import {CommentService} from "../../services/comment.service";
import {AuthService} from "../../services/auth.service";
import {MovieService} from "../../services/movie.service";
import {NotificationService} from "../../services/notification.service";

@Component({
  selector: 'app-comment-thread',
  templateUrl: './comment-thread.component.html',
  styleUrls:['./comment-thread.component.scss']
})
export class CommentThreadComponent {
  @Input() comment!: CommentModel;
  @Input() movieId!: string;
  @Input() rootUsername!:string;
  @Output() onReplySubmitted = new EventEmitter<CommentModel>();

  replying = false;
  replyContent = '';
  isSending = false;

  constructor(
    private movieService: MovieService,
    private commentService: CommentService,
    public authService:AuthService,
    private notification:NotificationService) {
  }

  toggleReplyForm(){
    this.replying = !this.replying;
  }

  cancelReply(){
    this.replying = false;
    this.replyContent = '';
  }
  toggleLike(commentId: string) {
    if (!this.authService.isLoggedIn()) {
      this.notification.show("Vui lòng đăng nhập để bày tỏ cảm xúc", 'warning');
      return;
    }

    // Lưu trạng thái cũ để khôi phục nếu có lỗi
    const originalReaction = this.comment.userReaction;
    const originalLikeCount = this.comment.likeCount;
    const originalDislikeCount = this.comment.dislikeCount;

    // Cập nhật UI ngay lập tức
    if (this.comment.userReaction === 'LIKE') {
      // Bỏ like
      this.comment.userReaction = null;
      this.comment.likeCount--;
    } else {
      // Thêm like
      if (this.comment.userReaction === 'DISLIKE') {
        this.comment.dislikeCount--; // Bỏ dislike cũ
      }
      this.comment.userReaction = 'LIKE';
      this.comment.likeCount++;
    }

    // Gọi API
    this.commentService.addLikeComment(commentId).subscribe({
      error: (err) => {
        // Khôi phục lại trạng thái nếu có lỗi
        this.comment.userReaction = originalReaction;
        this.comment.likeCount = originalLikeCount;
        this.comment.dislikeCount = originalDislikeCount;
        console.error(err);
        this.notification.show("Có lỗi khi gửi phản ứng!", 'error');
      }
    });
  }

  toggleDislike(commentId: string) { // Sửa: toggleDislike
    if (!this.authService.isLoggedIn()) {
      this.notification.show("Vui lòng đăng nhập để bày tỏ cảm xúc", 'warning');
      return;
    }

    const originalReaction = this.comment.userReaction;
    const originalLikeCount = this.comment.likeCount;
    const originalDislikeCount = this.comment.dislikeCount;

    if (this.comment.userReaction === 'DISLIKE') {
      // Bỏ dislike
      this.comment.userReaction = null;
      this.comment.dislikeCount--;
    } else {
      if (this.comment.userReaction === 'LIKE') {
        this.comment.likeCount--;
      }
      this.comment.userReaction = 'DISLIKE';
      this.comment.dislikeCount++;
    }

    this.commentService.addDislikeComment(commentId).subscribe({
      error: (err) => {
        this.comment.userReaction = originalReaction;
        this.comment.likeCount = originalLikeCount;
        this.comment.dislikeCount = originalDislikeCount;
        console.error(err);
        this.notification.show("Có lỗi khi gửi phản ứng!", 'error');
      }
    });
  }
  sendReply(){
    if(!this.replyContent.trim()) return;
    this.isSending = true;

    this.movieService.postComment(this.movieId,this.replyContent,this.comment.id).subscribe({
      next:(res)=>{
        this.isSending = false;
        this.onReplySubmitted.emit(res);
        this.cancelReply();
      },
      error:()=>{
        this.isSending = false;
      }
    })
  }

  handleNewReply(reply:CommentModel){
    this.comment.replies = this.comment.replies||[];
    this.comment.replies.push(reply);
  }
}
