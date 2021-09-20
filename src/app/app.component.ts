import { Component, OnInit } from '@angular/core';
import { LeaderboardService } from './services/leaderboard.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  title = 'ballistica-web';
  constructor(private lBoard:LeaderboardService){}
  ngOnInit(){
    this.lBoard.loadLeaderboard();
  }
}
