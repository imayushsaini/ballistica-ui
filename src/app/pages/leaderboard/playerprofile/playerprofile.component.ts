import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-playerprofile',
  templateUrl: './playerprofile.component.html',
  styleUrls: ['./playerprofile.component.scss']
})
export class PlayerprofileComponent implements OnInit {
  
  @Output()
  closeBtnEvent=new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }
  onClose(){
    this.closeBtnEvent.emit('true');
  }

}
