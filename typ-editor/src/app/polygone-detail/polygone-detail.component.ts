import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Polygon } from 'src/TYP_File_lib/TypFile_blocks/Polygon';

@Component({
  selector: 'app-polygone-detail',
  templateUrl: './polygone-detail.component.html',
  styleUrls: ['./polygone-detail.component.css']
})
export class PolygoneDetailComponent implements OnInit {

  polygone: Polygon;

  constructor(@Inject(MAT_DIALOG_DATA) private data: Polygon) { 
    this.polygone = data;
  }

  ngOnInit(): void {
  }

}
