import {Component, EventEmitter, OnDestroy, OnInit, Output} from '@angular/core';
import {
  AbstractControl, Form,
  FormArray,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators
} from "@angular/forms";
import {UserService} from "../../../services/user.service";
import {NotificationService} from "../../../services/notification.service";
import {finalize, takeUntil} from "rxjs/operators";
import {User} from "../../../models/user.model";
import {Subject} from "rxjs";

@Component({
  selector: 'app-user-create',
  templateUrl: './user-create.component.html',
  styleUrls: ['./user-create.component.scss']
})
export class UserCreateComponent implements OnInit, OnDestroy {
  @Output() closeModal = new EventEmitter<void>();
  @Output() userCreated = new EventEmitter<User>();

  userForm!: FormGroup;
  isLoading = false;
  showPassword = false;
  error: string | null = null;
  allAvailableRoles: string[] = ['ADMIN', 'USER'];
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private notification: NotificationService
  ) {
  }

  ngOnInit(): void {
    this.userForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      enabled: [true],
      roles: this.buildRoles()
    }, {
      validators: this.passwordMatchValidator
    });
  }

  buildRoles(): FormArray {
    const arr = this.allAvailableRoles.map(role => {
      return this.fb.control(role === 'USER');
    })
    return this.fb.array(arr, [this.minOneCheckboxCheckedValidator()]);
  }

  minOneCheckboxCheckedValidator(): ValidatorFn {
    return (formArray: AbstractControl): ValidationErrors | null => {
      if (formArray instanceof FormArray) {
        const atLeastCheckOne = formArray.controls.some(control => control.value === true)
        return atLeastCheckOne ? null : {requiredOneCheckbox: true}
      }
      return null;
    }
  }

  // Validator tùy chỉnh để so sánh mật khẩu
  passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    return password && confirmPassword && password.value !== confirmPassword.value ? {passwordMismatch: true} : null;
  };

  onSubmit() {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    this.error = null;
    const formValue = this.userForm.getRawValue();
    const selectedRoles = formValue.roles
      .map((checked: boolean, i: number) => checked ? this.allAvailableRoles[i] : null)
      .filter((name: string | null) => name !== null);
    const {confirmPassword,...rest} = formValue
    const payload = {...rest, roles: selectedRoles};
    console.log("PayLoad:{}", payload);
    this.userService.createUserByAdmin(payload).pipe(
      finalize(() => this.isLoading = false),
      takeUntil(this.destroy$)
    ).subscribe({
      next: (newUser) => {
        this.notification.show(`Tạo người dùng ${newUser.username} thành công!`, 'success');
        this.userCreated.emit(newUser);
        console.log("NewUser:{}", newUser);
      },
      error: (err) => {
        this.error = err.error?.message || 'Tên đăng nhập hoặc email đã tồn tại.';
      }
    });
  }

  get rolesFormArray() {
    return this.userForm.get('roles') as FormArray;
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onCancel() {
    this.closeModal.emit();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
