import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-prompt-message',
  templateUrl: './prompt-message.component.html',
  styleUrls: ['./prompt-message.component.scss']
})
export class PromptMessageComponent implements OnInit {
  @Input() isVisible = false;
  @Input() title = 'Xác nhận'
  @Input() message = "Bạn có chắc chắn muốn thực hiện hành động này không?"
  @Input() confirmButtonText = 'Xác nhận'
  @Input() cancelButtonText = 'Huỷ'

  @Output() onConfirm = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();
  confirm(){
    this.onConfirm.emit();
    this.close();
  }
  cancel(){
    this.onCancel.emit();
    this.close();
  }
  close(){
    this.isVisible = false;
  }
  constructor() { }

  ngOnInit(): void {
  }

}
