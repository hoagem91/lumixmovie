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
  { path: "login", component: LoginAdminComponent, title: "Lumix Admin – Đăng nhập" },
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [AdminGuard],
    children: [
      { path: 'dashboard', component: AdminDashboardComponent, title: 'Lumix Admin – Bảng điều khiển' },
      { path: "movies/create", component: MovieManagementComponent, title: 'Lumix Admin – Thêm phim mới' },
      { path: "movies/update", component: MovieUpdateComponent, canDeactivate: [UnsavedChangesGuard], title: 'Lumix Admin – Cập nhật phim' },
      { path: "movies/delete", component: MovieDeleteComponent, title: 'Lumix Admin – Xóa phim' },
      { path: 'users', component: UserManagementComponent, title: 'Lumix Admin – Quản lý người dùng' },
      { path: 'users/create', component: UserCreateComponent, title: 'Lumix Admin – Thêm người dùng' },
      { path: 'users/update', component: UserUpdateComponent, canDeactivate: [UnsavedChangesGuard], title: 'Lumix Admin – Cập nhật người dùng' },
      { path: 'comments', component: CommentManagementComponent, title: 'Lumix Admin – Quản lý bình luận' },
      { path: 'genres', component: GenreManagementComponent, title: 'Lumix Admin – Quản lý thể loại' },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
