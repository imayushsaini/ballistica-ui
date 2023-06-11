import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { SwPush } from "@angular/service-worker";
import { NotificationService } from "./notification.service";

import { environment } from "./../../environments/environment";
import { MainService } from "./main.service";
const httpOption = {
  headers: new HttpHeaders({ "Content-Type": "application/json" }),
};

@Injectable({
  providedIn: "root",
})
export class SubscribeService {
  vapidKeys: string = environment.vapidKey;
  payload = JSON.stringify({
    notification: {
      title: "Web Mail Notification",
      body: "New Mail Received!",
      icon: "images/bell.jpg",
      vibrate: [100, 50, 100], //will cause the device to vibrate for 100 ms, be still for 50 ms, and then vibrate for 100 ms
      requireInteraction: true,
      data: { dateOfArrival: Date.now() },
      actions: [{ action: "inbox", title: "Go to Web Mail" }],
    },
  });

  constructor(
    private swPush: SwPush,
    private service: NotificationService,
    private mainservice: MainService
  ) {}

  triggerMessage() {
    this.service.triggerMessage(this.payload).subscribe(
      (x) => console.log(x),
      (err) => console.log(err)
    );
  }

  subscribeToNotifications(player_id: string, name: string) {
    console.log(this.swPush.isEnabled);
    if (this.swPush.isEnabled) {
      this.swPush.notificationClicks.subscribe((x) => console.log(x));
      const vapidKey = this.mainservice.getVapidKey();
      this.swPush
        .requestSubscription({
          serverPublicKey: vapidKey,
        })
        .then((sub) => {
          const msg = { subscription: sub, player_id: player_id, name: name };
          this.service.subscribe(msg).subscribe(
            (x) => console.log(x),
            (err) => console.log(err)
          );
        })
        .catch((err) =>
          console.error("Could not subscribe to notifications", err)
        );
    }
  }
}
