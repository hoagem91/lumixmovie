import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import {AuthService} from "../../../services/auth.service";

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss']
})
export class AdminLayoutComponent {
  isSidebarOpen = false;
  isMovieMenuOpen = false;
  isMobileView = false;

  constructor(private router: Router,private authService:AuthService) {
    this.checkScreenSize();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event?: any) {
    this.checkScreenSize();
  }

  private checkScreenSize() {
    const wasMobile = this.isMobileView;
    this.isMobileView = window.innerWidth <= 768;

    if (wasMobile && !this.isMobileView) {
      this.isSidebarOpen = false;
    }
  }

  toggleSidebar() {
    if (this.isMobileView) {
      this.isSidebarOpen = !this.isSidebarOpen;

      if (this.isSidebarOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    }
  }

  toggleMovieMenu(event: Event) {
    event.preventDefault();
    this.isMovieMenuOpen = !this.isMovieMenuOpen;
  }

  closeSidebarOnNavigate() {
    if (this.isMobileView && this.isSidebarOpen) {
      this.toggleSidebar();
    }
  }

  logout() {
    this.authService.logout();
  }
}
