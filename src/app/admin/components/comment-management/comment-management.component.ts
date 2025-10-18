import {Component, OnDestroy, OnInit} from '@angular/core';
import {debounce, debounceTime, Subject, switchMap} from "rxjs";
import {FormBuilder, FormGroup} from "@angular/forms";
import {MovieService} from "../../../services/movie.service";
import {NotificationService} from "../../../services/notification.service";
import {takeUntil} from "rxjs/operators";
import {CommentModel} from "../../../models/comment.model";
import {error} from "@angular/compiler-cli/src/transformers/util";

interface SelectableComment extends CommentModel {
  selected?: boolean;
}

@Component({
  selector: 'app-comment-management',
  templateUrl: 'comment-management.component.html',
  styleUrls: ['comment-management.component.scss']
})
export class CommentManagementComponent implements OnInit, OnDestroy {
  isLoading = true;
  isSearching = false;
  allComment: SelectableComment[] = [];
  filteredComments: SelectableComment[] = [];
  paginatedComments: SelectableComment[] = [];
  isVisible = false;
  promptTitle = '';
  promptMessage = '';
  private deletionMode: 'single' | 'bulk' | null = null;
  private commentIdToDelete: string | null = null;
  currentPage = 1;
  itemsPerPage = 5;
  totalPages = 0;
  filterForm!: FormGroup;
  selectedComment: SelectableComment | null = null;

  private destroy$ = new Subject<void>()

  constructor(private fb: FormBuilder, private commentService: MovieService, private notification: NotificationService) {
  }

  ngOnInit(): void {
    this.initFilterForm();
  }

  initFilterForm() {
    this.filterForm = this.fb.group({
      searchText: [''],
      dateFrom: [''],
      dateTo: ['']
    });
    this.filterForm.valueChanges.pipe(
      debounceTime(300),
      switchMap(() => {
        this.isLoading = true;
        const filterValue = this.filterForm.value;
        this.isSearching = !!filterValue.searchText || !!filterValue.dateFrom || !!filterValue.dateTo;
        return this.commentService.searchComments(filterValue);
      }),
      takeUntil(this.destroy$)
    ).subscribe({
      next: (comments) => {
        console.log(comments)
        this.allComment = comments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        this.filteredComments = [...this.allComment];
        this.totalPages = Math.ceil(this.filteredComments.length / this.itemsPerPage);
        this.changePage(1);
        this.isLoading = false;
      },
      error: () => {
        this.notification.show("Không thể tải danh sách bình luận", "error");
        this.isLoading = false;
        this.allComment = [];
        this.filteredComments = [];
        this.paginatedComments = [];
        this.totalPages = 0;
      }
    });

    // Trigger initial search on component load
    this.filterForm.updateValueAndValidity({emitEvent: true});
  }

  resetFilters() {
    this.filterForm.reset({searchText: '', dateFrom: '', dateTo: ''});
  }

  changePage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedComments = this.filteredComments.slice(startIndex, endIndex);
  }

  getPageNumbers(): number[] {
    return Array.from({length: this.totalPages}, (_, i) => i + 1);
  }

  toggleSelectAll(checked: boolean) {
    this.filteredComments.forEach(c => c.selected = checked);
  }

  areAllSelected() {
    if (this.filteredComments.length === 0) return false;
    return this.filteredComments.every(c => c.selected);
  }

  getSelectedComments(): SelectableComment[] {
    return this.filteredComments.filter(c => c.selected);

  }

  askForDeleteCommentConfirm(movieId: string, commentId: string) { // movieId is kept for potential future use
    this.deletionMode = 'single';
    this.commentIdToDelete = commentId;
    this.isVisible = true;
    this.promptTitle = 'Xác nhận xóa';
    this.promptMessage = 'Bạn có chắc chắn muốn xóa bình luận này không?';
  }

  askForBulkDeleteConfirm() {
    const selectedCount = this.getSelectedComments().length;
    if (selectedCount === 0) {
      this.notification.show('Vui lòng chọn ít nhật một bình luận để xóa!', 'warning');
      return;
    }
    this.deletionMode = 'bulk';
    this.isVisible = true;
    this.promptTitle = "Xác nhận xóa hàng loạt"
    this.promptMessage = `Bạn có muốn xoá ${selectedCount} bình luận đã chọn không?`;
  }

  confirmDelete(): void {
    this.isVisible = false;
    if (this.deletionMode === 'bulk') {
      this.deleteSelectedComments();
    } else if (this.deletionMode === 'single' && this.commentIdToDelete) {
      this.deleteSingleComment(this.commentIdToDelete);
    }
    this.resetDeletionState();
  }

  cancelDelete(): void {
    this.isVisible = false;
    this.resetDeletionState();
  }

  private deleteSingleComment(commentId: string): void {
    this.deleteCommentsByIds([commentId], 'Bình luận đã được xóa thành công.');
  }

  private deleteSelectedComments(): void {
    const selectedComments = this.getSelectedComments();
    const idsToDelete = selectedComments.map(comment => comment.id);
    if (idsToDelete.length === 0) return;

    const successMessage = `Đã xóa thành công ${idsToDelete.length} bình luận.`;
    this.deleteCommentsByIds(idsToDelete, successMessage);
  }

  private deleteCommentsByIds(idsToDelete: string[], successMessage: string): void {
    this.commentService.deleteCommentForAdmin(idsToDelete).subscribe({
      next: () => {
        this.notification.show(successMessage, "success");
        this.filterForm.updateValueAndValidity({emitEvent: true}); // Re-trigger search after delete
      },
      error: (err) => {
        this.notification.show('Đã xảy ra lỗi trong quá trình xóa.', 'error');
        console.error('Delete error:', err);
      }
    })
  }

  viewCommentDetail(comment: SelectableComment) {
    this.selectedComment = comment;
  }

  handleCommentUpdated(updatedComment: CommentModel) {
    const index = this.allComment.findIndex(c => c.id === updatedComment.id);
    if (index != -1) {
      this.allComment[index] = updatedComment;
      this.filterForm.updateValueAndValidity({emitEvent: true}); // Re-trigger search after update
    }
    this.closeDetailModal()
  }

  closeDetailModal() {
    this.selectedComment = null;
  }

  private resetDeletionState(): void {
    this.deletionMode = null;
    this.commentIdToDelete = null;
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }
}
