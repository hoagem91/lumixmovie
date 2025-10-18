import {Component, HostListener, OnInit} from '@angular/core';
import {UserService} from "../../../services/user.service";
import {NotificationService} from "../../../services/notification.service";
import {User} from "../../../models/user.model";
import {Router} from "@angular/router";
import {HttpErrorResponse} from "@angular/common/http";

@Component({
  selector: 'app-user-management',
  templateUrl: 'user-management.component.html',
  styleUrls: ['user-management.component.scss']
})
export class UserManagementComponent implements OnInit {
  isLoading = false;
  allUsers: User[] = [];
  paginatedUsers: User[] = [];
  currentPage = 1;
  itemsPerPage = 5;
  totalPages = 0;
  openMenuUserId: string | null = null;
  isVisible = false;
  promptTitle = '';
  promptMessage = '';
  isEditModalVisible = false;
  isCreateModalVisible = false;
  selectedUserForEdit:User|null=null;
  private userToDelete: { userId: string, username: string } | null = null;

  constructor(private userService: UserService, private notification: NotificationService, private router: Router) {
  }

  ngOnInit(): void {
    this.loadUserData();
  }

  loadUserData() {
    this.isLoading = true;
    this.userService.getAllUsers().subscribe({
      next: (data) => {
        this.allUsers = data;
        this.isLoading = false;
        this.totalPages = Math.ceil(this.allUsers.length / this.itemsPerPage);
        this.updatePaginatedUsers();
      },
      error: () => {
        this.notification.show("Không thể tải dữ liệu người dùng!", 'error');
        this.isLoading = false;
      }
    });
  }

  updatePaginatedUsers() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedUsers = this.allUsers.slice(startIndex, endIndex);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedUsers();

    }
  }

  getPageNumbers(): number[] {
    return Array.from({length: this.totalPages}, (_, i) => i + 1);
  }

  onUserActions(userId: string, event: MouseEvent) {
    event.stopPropagation();
    // check dong mo menu action
    if (this.openMenuUserId === userId) {
      this.openMenuUserId = null;
    } else {
      this.openMenuUserId = userId;
    }
  }

  @HostListener('document:click', ['$event'])
  clickout() {
    if (this.openMenuUserId) {
      this.openMenuUserId = null;
    }
  }

  getAccessTagClass(role: string): string {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'tag-admin'
      default:
        return 'tag-default'
    }
  }

  askForDeleteConfirm(userId: string, username: string) {
    this.userToDelete = {userId: userId, username: username}
    this.isVisible = true;
    this.promptTitle = "Xác nhận"
    this.promptMessage = `Bạn có muốn xoá người dùng ${username} không!`
  }

  onDeleteUser() {
    if (!this.userToDelete) return;
    this.userService.deleteUserById(this.userToDelete.userId).subscribe({
      next: () => {
        this.notification.show(`Đã xoá người dùng ${this.userToDelete?.username} thành công.`, 'success');
        this.allUsers = this.allUsers.filter(user => user.userId !== this.userToDelete?.userId);
        this.totalPages = Math.ceil(this.allUsers.length / this.itemsPerPage);
        if (this.paginatedUsers.length === 1 && this.currentPage > 1) {
          this.currentPage--;
        }
        this.updatePaginatedUsers();
        this.isVisible = false;
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === 403) {
          this.notification.show(`Không có quyền xóa người dùng ${this.userToDelete?.username}!`, 'warning');
        } else {
          this.notification.show("Xoá người dùng thất bại!", 'error');
        }
        this.isVisible = false;
      }
    });
  }
  onEditModal(user: User) {
    this.selectedUserForEdit = user;
    this.isEditModalVisible = true;
    this.openMenuUserId = null;
  }
  closeEditModal(){
    this.isEditModalVisible = false;
    this.selectedUserForEdit = null;
  }
  onCreateModel(){
    this.isCreateModalVisible = true;
    this.openMenuUserId = null;
  }
  closeCreateModel(){
    this.isCreateModalVisible = false;
    this.selectedUserForEdit = null;
  }
  handleUserUpdated(updatedUser:User){
    const index= this.allUsers.findIndex(u=>u.userId === updatedUser.userId);
    if(index!==-1){
      this.allUsers[index] = updatedUser;
      this.updatePaginatedUsers();
      this.notification.show(`Cập nhật người dùng ${updatedUser.username} thành công!`,'success');
    }
    this.closeEditModal();
  }
  handleUserCreate(newUser:User){
    this.allUsers.unshift(newUser);
    this.totalPages = Math.ceil(this.allUsers.length / this.itemsPerPage);
    this.updatePaginatedUsers();
    this.closeCreateModel();
  }
}
