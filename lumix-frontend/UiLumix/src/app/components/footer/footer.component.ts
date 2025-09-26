import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {

  footerSections = [
    {
      title: 'Home',
      links: [
        { name: 'Categories', url: '/categories' },
        { name: 'Devices', url: '/devices' },
        { name: 'Pricing', url: '/pricing' },
        { name: 'FAQ', url: '/faq' }
      ]
    },
    {
      title: 'Movies',
      links: [
        { name: 'Genres', url: '/movies/genres' },
        { name: 'Trending', url: '/movies/trending' },
        { name: 'New Release', url: '/movies/new-release' },
        { name: 'Popular', url: '/movies/popular' }
      ]
    },
    {
      title: 'Shows',
      links: [
        { name: 'Genres', url: '/shows/genres' },
        { name: 'Trending', url: '/shows/trending' },
        { name: 'New Release', url: '/shows/new-release' },
        { name: 'Popular', url: '/shows/popular' }
      ]
    },
    {
      title: 'Support',
      links: [
        { name: 'Contact Us', url: '/contact' }
      ]
    },
    {
      title: 'Subscription',
      links: [
        { name: 'Plans', url: '/subscription/plans' },
        { name: 'Features', url: '/subscription/features' }
      ]
    }
  ];

  socialLinks = [
    { name: 'Facebook', url: 'https://facebook.com', icon: 'fab fa-facebook-f' },
    { name: 'Twitter', url: 'https://twitter.com', icon: 'fab fa-twitter' },
    { name: 'LinkedIn', url: 'https://linkedin.com', icon: 'fab fa-linkedin-in' }
  ];

  legalLinks = [
    { name: 'Terms of Use', url: '/terms' },
    { name: 'Privacy Policy', url: '/privacy' },
    { name: 'Cookie Policy', url: '/cookie-policy' }
  ];

  currentYear = new Date().getFullYear();

  constructor() { }

  onSocialClick(url: string): void {
    window.open(url, '_blank');
  }

}
