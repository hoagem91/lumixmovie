import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators
} from "@angular/forms";
import {User} from "../../../models/user.model";
import {forkJoin, of, Observable} from "rxjs";
import {UserService} from "../../../services/user.service";
import {NotificationService} from "../../../services/notification.service";

@Component({
  selector: 'app-user-update',
  templateUrl: './user-update.component.html',
  styleUrls: ['./user-update.component.scss']
})
export class UserUpdateComponent implements OnInit, OnChanges {
  @Input() userToEdit: User | null = null;
  @Output() userUpdate = new EventEmitter<User>();
  @Output() closeModal = new EventEmitter<void>();
  updateForm!: FormGroup;
  isSubmitting = false;
  allAvailableRoles: string[] = ['ADMIN', 'USER'];

  constructor(private fb: FormBuilder, private userService: UserService, private notification: NotificationService) {
    this.updateForm = this.fb.group({
      username: [{value: '', disabled: true}],
      email: ['', [Validators.required, Validators.email]],
      roles: this.fb.array([], [this.minOneCheckboxCheckedValidator()])
    })
  }

  ngOnInit(): void {
  }

  get rolesFormArray() {
    return this.updateForm.controls['roles'] as FormArray;
  }

  minOneCheckboxCheckedValidator(): ValidatorFn {
    return (formArray: AbstractControl): ValidationErrors | null => {
      if (formArray instanceof FormArray) {
        const atLeastOneChecked = formArray.controls.some(control => control.value === true);
        return atLeastOneChecked ? null : {requiredOneCheckbox: true}
      }
      return null;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['userToEdit'] && this.userToEdit) {
      this.updateForm.patchValue({
        username: this.userToEdit.username,
        email: this.userToEdit.email
      });
      this.rolesFormArray.clear();
      const userRoleNames = this.userToEdit.roles.map(r => r.name);
      this.allAvailableRoles.forEach(roleName => {
        const isChecked = userRoleNames.includes(roleName);
        this.rolesFormArray.push(new FormControl(isChecked));
      })
    }
  }

  onSave() {
    if (this.updateForm.invalid || !this.userToEdit) {
      return;
    }
    this.isSubmitting = true;

    const selectedRoleNames: string[] = this.updateForm.value.roles
      .map((checked: boolean, i: number) => checked ? this.allAvailableRoles[i] : null)
      .filter((name: string | null) => name !== null);

    const emailUpdatePayload = {
      email: this.updateForm.get('email')?.value,
    }
    const updateObservables: Observable<any>[] = [];

    if (this.updateForm.get('email')?.dirty) {
      updateObservables.push(this.userService.updateUserById(this.userToEdit.userId, emailUpdatePayload));
    }

    if (this.updateForm.get('roles')?.dirty) {
      updateObservables.push(this.userService.updateUserRoles(this.userToEdit.userId, selectedRoleNames));
    }

    if (updateObservables.length === 0) {
      this.isSubmitting = false;
      this.closeModal.emit();
      return;
    }
    // dung forkjoin de thuc thi tat ca cac api mot luc
    forkJoin(updateObservables).subscribe({
      next: (results) => {
        const updatedUser = {
          ...this.userToEdit!
        }
        updatedUser.username = this.updateForm.get('username')?.value,
          updatedUser.email = this.updateForm.get('email')?.value,
          updatedUser.roles = selectedRoleNames.map(name => ({name}))

        this.isSubmitting = false;
        this.userUpdate.emit(updatedUser);
      },
      error: () => {
        this.isSubmitting = false;
      }
    });
  }

  onCancel() {
    this.closeModal.emit();
  }
}
