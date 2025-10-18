import {Component, HostBinding, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-skeleton-loader',
  template: '',
  styleUrls: ['./skeleton-loader.component.scss']
})
export class SkeletonLoaderComponent implements OnInit {
  @HostBinding('style.width') @Input() width = '100%';
  @HostBinding('style.height') @Input() height = '20px';
  @HostBinding('className') @Input() className = '';
  constructor() { }

  ngOnInit(): void {
  }

}
