import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {LoginComponent} from './components/login/login.component';
import {RegisterComponent} from "./components/register/register.component";
import {HomeComponent} from "./pages/home/home.component";
import {MovieComponent} from "./pages/movie/movie.component";
import {MovieDetailComponent} from "./pages/movie-detail/movie-detail.component";
import {FavoritesComponent} from "./pages/favorites/favorites.component";
import {ProfileComponent} from "./pages/profile/profile.component";
import {WatchHistoryComponent} from "./pages/watch-history/watch-history.component";
import {VerifyAccountComponent} from "./pages/verify-account/verify-account.component";
import {LoginSuccessComponent} from "./pages/login-success/login-success.component";
import {MovieGridComponent} from "./components/movie-grid/movie-grid.component";

const routes: Routes = [
  {path: 'login', component: LoginComponent, title: 'Lumix – Đăng nhập'},
  {path: 'logout', component: LoginComponent, title: 'Lumix – Đăng xuất'},
  {path: 'home', component: HomeComponent, title: 'Lumix – Xem phim trực tuyến'},
  {path: 'movies', component: MovieComponent, title: 'Lumix – Danh sách phim'},
  {path: 'register', component: RegisterComponent, title: 'Lumix – Đăng ký tài khoản'},
  {path: 'movies/:id', component: MovieDetailComponent, title: 'Lumix – Chi tiết phim'},
  {path: 'category/:slug', component: MovieGridComponent, title: 'Lumix – Danh mục phim'},
  {path: 'favorites', component: FavoritesComponent, title: 'Lumix – Danh sách yêu thích'},
  {path: 'profile', component: ProfileComponent, title: 'Lumix – Hồ sơ cá nhân'},
  {path: 'history', component: WatchHistoryComponent, title: 'Lumix – Lịch sử xem phim'},
  {path: 'registration-pending', component: VerifyAccountComponent, title: 'Lumix – Xác minh tài khoản'},
  {path: 'verify-account/:token', component: VerifyAccountComponent, title: 'Lumix – Kích hoạt tài khoản'},
  {path: 'login-success', component: LoginSuccessComponent, title: 'Lumix – Đăng nhập thành công'},
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule),
    title: 'Lumix – Quản trị'
  },
  {path: '', redirectTo: '/home', pathMatch: 'full'},
  {path: '**', redirectTo: '/home'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {scrollPositionRestoration: 'enabled'})],
  exports: [RouterModule]
})
export class AppRoutingModule {}
