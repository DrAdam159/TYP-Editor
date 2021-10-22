import { Component, OnInit, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { POI } from 'src/TYP_File_lib/TypFile_blocks/POI';
import { PoiDetailComponent } from '../poi-detail/poi-detail.component';
import { FileService } from '../services/file.service';

@Component({
  selector: 'app-poi',
  templateUrl: './poi.component.html',
  styleUrls: ['./poi.component.css']
})
export class PoiComponent implements OnInit {

  poiList!: Array<POI>;

  constructor(private fileService: FileService, private matDialog: MatDialog) { 
   if(this.fileService.getPOIList()) {
      this.poiList = this.fileService.getPOIList();
    }
  }

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
