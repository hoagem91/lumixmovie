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
  {path: 'login', component: LoginComponent},
  {path: 'logout', component: LoginComponent},
  {path: 'home', component: HomeComponent},
  {path: 'movies', component: MovieComponent},
  {path: 'register', component: RegisterComponent},
  {path:'movies/:id',component:MovieDetailComponent},
  {path:'category/:slug',component:MovieGridComponent},
  {path:'favorites',component:FavoritesComponent},
  {path:"profile",component:ProfileComponent},
  {path:'history',component:WatchHistoryComponent},
  {path:'registration-pending',component:VerifyAccountComponent},
  {path:"verify-account/:token",component:VerifyAccountComponent},
  {path:"login-success",component:LoginSuccessComponent},
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule)
  },
  {path: '', redirectTo: '/home', pathMatch: 'full'},
  {path: '**', redirectTo: '/home'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
