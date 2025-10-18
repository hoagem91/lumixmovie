import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {AdminRoutingModule} from './admin-routing.module';
import {AdminDashboardComponent} from './components/admin-dashboard/admin-dashboard.component';
import {AdminLayoutComponent} from './components/admin-layout/admin-layout.component';
import {MovieManagementComponent} from './components/movie-create/movie-management.component';
import {UserManagementComponent} from './components/user-management/user-management.component';
import {CommentManagementComponent} from './components/comment-management/comment-management.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MovieUpdateComponent} from './components/movie-update/movie-update.component';
import {MovieDeleteComponent} from './components/movie-delete/movie-delete.component';
import {PromptMessageComponent} from "../components/prompt-message/prompt-message.component";
import { UserCreateComponent } from './components/user-create/user-create.component';
import { UserUpdateComponent } from './components/user-update/user-update.component';
import { LoginAdminComponent } from './components/login-admin/login-admin.component';
import {CommentUpdateComponent} from "./components/comment-update/comment-update.component";
import { GenreManagementComponent } from './components/genre-management/genre-management.component';
import {NgChartsModule} from "ng2-charts";

@NgModule({
  declarations: [
    AdminDashboardComponent,
    AdminLayoutComponent,
    MovieManagementComponent,
    UserManagementComponent,
    CommentManagementComponent,
    CommentUpdateComponent,
    MovieUpdateComponent,
    MovieDeleteComponent,
    PromptMessageComponent,
    UserCreateComponent,
    UserUpdateComponent,
    LoginAdminComponent,
    GenreManagementComponent
  ],
  exports: [
    PromptMessageComponent
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    NgChartsModule
  ]
})
export class AdminModule {
}
