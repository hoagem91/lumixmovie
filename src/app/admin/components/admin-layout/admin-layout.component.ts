import {Component, HostListener, OnInit} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {AuthService} from "../../../services/auth.service";
import {Title} from "@angular/platform-browser";
import {filter, map, mergeMap} from "rxjs/operators";

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss']
})
export class AdminLayoutComponent implements OnInit {
  isSidebarOpen = false;
  isMovieMenuOpen = false;
  isMobileView = false;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private titleService: Title,
    private authService:AuthService
  ) {
    this.checkScreenSize();
  }

  ngOnInit(){
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => {
        let route = this.activatedRoute;
        while (route.firstChild) route = route.firstChild;
        return route;
      }),
      mergeMap(route => route.data)
    ).subscribe(data => {
      if (data['title']) {
        this.titleService.setTitle(data['title']);
      }
    });
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
