import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GraphicElement } from 'src/TYP_File_lib/TypFile_blocks/GeneralDataBlocks/GraphicElement';
import { Polyline } from 'src/TYP_File_lib/TypFile_blocks/Polyline';
import { PolylineDetailComponent } from '../polyline-detail/polyline-detail.component';
import { FileService } from '../services/file.service';

@Component({
  selector: 'app-polyline',
  templateUrl: './polyline.component.html',
  styleUrls: ['./polyline.component.css']
})
export class PolylineComponent implements OnInit {

  polylineList!: Array<Polyline>;

  constructor(private fileService: FileService, private matDialog: MatDialog) { 
    if(this.fileService.getPOIList()) {
      this.polylineList = this.fileService.getPolylineList();
    }
  }

  ngOnInit(): void {
    this.fileService.notifyObservable$.subscribe(res => {
      if (res.refresh) {
         this.polylineList = this.fileService.getPolylineList();
      }
   })
  }

  openPolylineDetail(polylineItem: Polyline): void {
    this.matDialog.open(PolylineDetailComponent, {
      data: {
        polyline: polylineItem
      }
    });
  }
}
