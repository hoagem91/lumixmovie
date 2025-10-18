import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.scss']
})
export class PopupComponent {
  @Input() title: string = '';
  @Input() items: any[] = [];
  @Input() type: 'movies' | 'categories' | 'comments' = 'movies';
  @Input() isVisible: boolean = false;

  @Output() close = new EventEmitter<void>();

  onClose() {
    this.close.emit();
  }
}
