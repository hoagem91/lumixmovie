import {Component} from '@angular/core';
import {AuthService} from '../../../services/auth.service';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss']
})
export class AdminLayoutComponent {
  isMovieMenuOpen = false;

  constructor(private authService: AuthService) {
  }

  logout() {
    this.authService.logout();
  }

  toggleMovieMenu(event: Event) {
    event.preventDefault();
    this.isMovieMenuOpen = !this.isMovieMenuOpen;
  }
}
