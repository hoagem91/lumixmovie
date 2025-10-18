import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AdminDashboardComponent} from './components/admin-dashboard/admin-dashboard.component';
import {AdminLayoutComponent} from './components/admin-layout/admin-layout.component';
import {MovieManagementComponent} from './components/movie-create/movie-management.component';
import {UserManagementComponent} from './components/user-management/user-management.component';
import {CommentManagementComponent} from './components/comment-management/comment-management.component';
import {MovieUpdateComponent} from "./components/movie-update/movie-update.component";
import {MovieDeleteComponent} from "./components/movie-delete/movie-delete.component";
import {UnsavedChangesGuard} from "../guards/unsaved-changes.guard";
import {UserCreateComponent} from "./components/user-create/user-create.component";
import {UserUpdateComponent} from "./components/user-update/user-update.component";
import {LoginAdminComponent} from "./components/login-admin/login-admin.component";
import {AdminGuard} from "../guards/admin.guard";
import {GenreManagementComponent} from "./components/genre-management/genre-management.component";

const routes: Routes = [
  {path: "login", component: LoginAdminComponent},
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate:[AdminGuard],
    children: [
      {path: 'dashboard', component: AdminDashboardComponent},
      {path: "movies/create", component: MovieManagementComponent},
      {path: "movies/update", component: MovieUpdateComponent, canDeactivate: [UnsavedChangesGuard]},
      {path: "movies/delete", component: MovieDeleteComponent},
      {path: 'users', component: UserManagementComponent},
      {path: 'users/create', component: UserCreateComponent},
      {path: 'users/update', component: UserUpdateComponent, canDeactivate: [UnsavedChangesGuard]},
      {path: 'comments', component: CommentManagementComponent},
      {path: 'genres', component: GenreManagementComponent},
      {path: '', redirectTo: 'dashboard', pathMatch: 'full'},
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule {
}
