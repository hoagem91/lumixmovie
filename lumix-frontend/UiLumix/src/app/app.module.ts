import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {HttpClientModule, HTTP_INTERCEPTORS} from '@angular/common/http';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';

import {LoginComponent} from "./components/login/login.component";
import {LogoutComponent} from "./components/logout/logout.component";
import {RegisterComponent} from './components/register/register.component';
import {SecureResourcePipe} from "./pipes/secure-resource.pipe";
import {HomeComponent} from './pages/home/home.component';
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {HeaderComponent} from './components/header/header.component';
import {FooterComponent} from './components/footer/footer.component';
import {MovieComponent} from "./pages/movie/movie.component";
import { HeroSectionComponent } from './components/hero-section/hero-section.component';
import { MovieCarouselComponent } from './components/movie-carousel/movie-carousel.component';
import {AuthInterceptor} from "./interceptors/auth.interceptor";
import { MovieDetailComponent } from './pages/movie-detail/movie-detail.component';
import { CommentSectionComponent } from './components/comment-section/comment-section.component';
import { FavoritesComponent } from './pages/favorites/favorites.component';
import { NotificationComponent } from './components/notification/notification.component';
import { ProfileComponent } from './pages/profile/profile.component';
import {SkeletonDirective} from "./directives/directive-skeleton/skeleton.directive";
import { SkeletonLoaderComponent } from './shared/components/skeleton-loader/skeleton-loader.component';
import { WatchHistoryComponent } from './pages/watch-history/watch-history.component';
import { HistoryCardComponent } from './components/history-card/history-card.component';
import { VerifyAccountComponent } from './pages/verify-account/verify-account.component';
import { LoginSuccessComponent } from './pages/login-success/login-success.component';
import {AdminModule} from "./admin/admin.module";
import { CategoryCardsComponent } from './components/category-cards/category-cards.component';
import { MovieGridComponent } from './components/movie-grid/movie-grid.component';
import { TopMoviesComponent } from './components/top-movies/top-movies.component';
import { DashboardCommentComponent } from './components/dashboard-comment/dashboard-comment.component';
import { PopupComponent } from './components/popup/popup.component';
import { CommentThreadComponent } from './components/comment-thread/comment-thread.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    MovieComponent,
    LogoutComponent,
    RegisterComponent,
    SecureResourcePipe,
    HomeComponent,
    HeaderComponent,
    FooterComponent,
    HeroSectionComponent,
    MovieCarouselComponent,
    MovieDetailComponent,
    CommentSectionComponent,
    FavoritesComponent,
    NotificationComponent,
    ProfileComponent,
    SkeletonDirective,
    SkeletonLoaderComponent,
    WatchHistoryComponent,
    HistoryCardComponent,
    VerifyAccountComponent,
    LoginSuccessComponent,
    CategoryCardsComponent,
    MovieGridComponent,
    TopMoviesComponent,
    DashboardCommentComponent,
    PopupComponent,
    CommentThreadComponent
  ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        AppRoutingModule,
        HttpClientModule,
        FormsModule,
        ReactiveFormsModule,
        AdminModule
    ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
