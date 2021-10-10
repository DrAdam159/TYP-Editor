import { Component, OnInit, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { POI } from 'src/TYP_File_lib/TypFile_blocks/POI';
import { PoiDetailComponent } from '../poi-detail/poi-detail.component';

@Component({
  selector: 'app-poi',
  templateUrl: './poi.component.html',
  styleUrls: ['./poi.component.css']
})
export class PoiComponent implements OnInit {

  @Input() poiList!: Array<POI>;

  constructor(private matDialog: MatDialog) { }

  ngOnInit(): void {
  }

  openPOIDetail(poiItem: POI): void {
    this.matDialog.open( PoiDetailComponent, {
      data: {
        poi: poiItem
      }
    });
  }

}
