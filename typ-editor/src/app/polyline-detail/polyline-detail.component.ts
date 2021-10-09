import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Polyline } from 'src/TYP_File_lib/TypFile_blocks/Polyline';

@Component({
  selector: 'app-polyline-detail',
  templateUrl: './polyline-detail.component.html',
  styleUrls: ['./polyline-detail.component.css']
})
export class PolylineDetailComponent implements OnInit {

  polyline: Polyline;

  constructor(@Inject(MAT_DIALOG_DATA) private data: Polyline) {
    this.polyline = data;
   }

  ngOnInit(): void {
  }

}
