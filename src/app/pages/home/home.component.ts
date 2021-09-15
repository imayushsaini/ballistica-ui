import { Component, OnInit } from '@angular/core';

export interface PlayerData {
  name: string;
  rank: number;
  score: number;
  kills: number;
}
const TOP_RANK_DATA: PlayerData[] = [
  {rank: 1, name: 'DevoidBarracks11', score: 9535, kills: 456},
  {rank: 2, name: 'D A R K S E Ï D', score: 5678, kills: 345},
  {rank: 3, name: 'Linux31250', score: 6941, kills: 445},
  {rank: 4, name: '⎝✧GͥOͣDͫ✧⎠', score: 9012, kills: 457},
  {rank: 5, name: 'Mort starn', score: 1811, kills: 234}
];

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  columns = [
    {
      columnDef: 'rank',
      header: 'No.',
      cell: (element:  PlayerData) => `${element.rank}`
    },
    {
      columnDef: 'name',
      header: 'Name',
      cell: (element:  PlayerData) => `${element.name}`
    },
    {
      columnDef: 'score',
      header: 'score',
      cell: (element:  PlayerData) => `${element.score}`
    },
    {
      columnDef: 'kills',
      header: 'kills',
      cell: (element:  PlayerData) => `${element.kills}`
    }
  ];
  dataSource = TOP_RANK_DATA;
  displayedColumns = this.columns.map(c => c.columnDef);
  
  constructor() { }

  ngOnInit(): void {
  }

}
