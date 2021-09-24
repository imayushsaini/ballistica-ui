import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SubscribeService } from 'src/app/services/subscribe.service';

@Component({
  selector: 'app-playerprofile',
  templateUrl: './playerprofile.component.html',
  styleUrls: ['./playerprofile.component.scss']
})
export class PlayerprofileComponent implements OnInit {
  @Input()
  player:any;
  @Output()
  closeBtnEvent=new EventEmitter();

  constructor(private subService:SubscribeService,private _snackBar: MatSnackBar) { }

  ngOnInit(): void {
  }
  onClose(){
    this.closeBtnEvent.emit('true');
  }
  parseTime(date:string){
    return new Date(date);
  }
  getKD(kill:number,death:number){
    return (kill/death).toFixed(3)
  }
  subscribe(id:string,name:string){
    this.subService.subscribeToNotifications(id,name);
    let msg=`Subscribed to ${name} , conformation notification will be sent shortely.`
    this.openSnackBar(msg,"ok")
  }
  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action);
  }
}
