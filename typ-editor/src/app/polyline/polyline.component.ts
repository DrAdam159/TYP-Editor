import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Polyline } from 'src/TYP_File_lib/TypFile_blocks/Polyline';
import { PolylineDetailComponent } from '../polyline-detail/polyline-detail.component';

@Component({
  selector: 'app-polyline',
  templateUrl: './polyline.component.html',
  styleUrls: ['./polyline.component.css']
})
export class PolylineComponent implements OnInit {


  @Input() polylineList!: Array<Polyline>

  constructor(private matDialog: MatDialog) { }

  ngOnInit(): void {
  }

  openPolylineDetail(polylineItem: Polyline): void {
    this.matDialog.open(PolylineDetailComponent, {
      data: {
        polyline: polylineItem
      }
    });
  }
}
