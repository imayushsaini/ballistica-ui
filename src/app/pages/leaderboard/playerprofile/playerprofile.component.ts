import { Component, EventEmitter, Input, Output } from "@angular/core";

import { SubscribeService } from "src/app/services/subscribe.service";

@Component({
  selector: "app-playerprofile",
  templateUrl: "./playerprofile.component.html",
  styleUrls: ["./playerprofile.component.scss"],
})
export class PlayerprofileComponent {
  @Input()
  player: any;
  @Output()
  closeBtnEvent = new EventEmitter();

  constructor(private subService: SubscribeService) {}

  onClose() {
    this.closeBtnEvent.emit("true");
  }
  parseTime(date: string) {
    return new Date(date);
  }
  getKD(kill: number, death: number) {
    return (kill / death).toFixed(3);
  }
  subscribe(id: string, name: string) {
    this.subService.subscribeToNotifications(id, name);
  }
}
