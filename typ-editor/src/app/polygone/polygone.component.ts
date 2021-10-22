import { Component, OnInit, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Polygon } from 'src/TYP_File_lib/TypFile_blocks/Polygon';
import { PolygoneDetailComponent } from '../polygone-detail/polygone-detail.component';
import { FileService } from '../services/file.service';

@Component({
  selector: 'app-polygone',
  templateUrl: './polygone.component.html',
  styleUrls: ['./polygone.component.css']
})
export class PolygoneComponent implements OnInit {

  polygoneList!: Array<Polygon>;

  constructor(private fileService: FileService, private matDialog: MatDialog) { 
    if(this.fileService.getPOIList()) {
      this.polygoneList = this.fileService.getPolygoneList();
    }
  }

  ngOnInit(): void {
  }

  openPolygoneDetail(polygoneItem: Polygon): void {
    this.matDialog.open( PolygoneDetailComponent, {
      data: {
        polygone: polygoneItem
      }
    });
  }

}
