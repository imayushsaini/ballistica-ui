import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: 'root'
})

export class NotificationService {
  constructor(private http:HttpClient) { }
  subscribe(subscription:any){
    return this.http.post('http://localhost:3000/subscribe',subscription);
  }
  triggerMessage(message:any){
    return this.http.post('http://localhost:3000/message',JSON.parse(message));
  }
}
