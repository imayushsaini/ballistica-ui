import { Component, OnInit } from '@angular/core';
import { MainService } from 'src/app/services/main.service';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent implements OnInit {

  constructor(private mainservice:MainService) { }

  ngOnInit(): void {
  }
  openDiscord(){
       this.mainservice.getDiscord().subscribe(data=>{
         console.log(data);
         console.log(data['url'])
         window.open(data['url']);
       })

  }

}
