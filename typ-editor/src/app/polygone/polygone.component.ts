import { Component, OnInit, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Polygon } from 'src/TYP_File_lib/TypFile_blocks/Polygon';
import { PolygoneDetailComponent } from '../polygone-detail/polygone-detail.component';

@Component({
  selector: 'app-polygone',
  templateUrl: './polygone.component.html',
  styleUrls: ['./polygone.component.css']
})
export class PolygoneComponent implements OnInit {

  @Input() polygoneList!: Array<Polygon>;

  constructor(private matDialog: MatDialog) { }

  ngOnInit(): void {
  }

  openPolygoneDetail(polygoneItem: Polygon): void {
    this.matDialog.open( PolygoneDetailComponent, {
      data: {
        poi: polygoneItem
      }
    });
  }

}
