import {Component, OnInit} from '@angular/core';
import {User} from "../../models/user.model";
import {UserService} from "../../services/user.service";
import {AuthService} from "../../services/auth.service";
import {of} from "rxjs";
import {NotificationService} from "../../services/notification.service";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  profileForm!: FormGroup;
  isLoading = true;
  isEditing = false;
  isSaving = false;
  error: string | null = null;

  constructor(private userService: UserService, private authService: AuthService, private notification: NotificationService, private fb: FormBuilder) {
  }

  ngOnInit() {
    this.initForm();
    this.loadUserData();
  }

  private initForm() {
    this.profileForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]]
    });
    this.profileForm.disable();
  }

  loadUserData(): void {
    const userId = this.authService.getUserId();
    if (!userId) {
      this.error = "Vui lòng đăng nhập để xem thông tin cá nhân của bạn!";
      this.isLoading = false;
      return;
    }
    this.isLoading = true;
    this.userService.getUserById(userId).subscribe({
      next: userData => {
        this.user = userData;
        this.profileForm.patchValue(userData);
        this.isLoading = false;
      },
      error: err => {
        this.error = "Không thể tải thông tin tài khoản.Vui lòng thử lại sau";
        this.isLoading = false;
      }
    });
  }

  toggleEditMode() {
    this.isEditing = true;
    this.profileForm.enable();
  }

  cancelEdit() {
    this.isEditing = false;
    this.profileForm.disable();
    if (this.user) {
      this.profileForm.reset(this.user);
    }
  }

  saveChanges(): void {
    if (this.profileForm.invalid || !this.user) {
      this.notification.show("Vui lòng kiểm tra lại thông tin đã đăng nhập", 'warning');
      return;
    }
    this.isSaving = true;
    const updatedData = this.profileForm.value;
    this.userService.updateUserById(this.user.userId,updatedData).subscribe({
      next: (saveUser) => {
        this.user = saveUser;
        this.isSaving = false;
        this.isEditing = false;
        this.profileForm.disable();
        this.notification.show("Cập nhật thông tin thành công!", 'success');
      },
      error: err => {
        this.isSaving = false;
        this.notification.show("Cập nhật thông tin thất bại", 'error');
      }
    });
  }
}
