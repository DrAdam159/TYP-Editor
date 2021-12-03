import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Polyline } from 'src/TYP_File_lib/TypFile_blocks/Polyline';
import { FileService } from '../services/file.service';

@Component({
  selector: 'app-polyline',
  templateUrl: './polyline.component.html',
  styleUrls: ['./polyline.component.css']
})
export class PolylineComponent implements OnInit {

  polylineList!: Array<Polyline>;
  scaleValue: number;
  gridCols: number;

  constructor(private fileService: FileService, private matDialog: MatDialog, private router: Router) { 
    if(this.fileService.getPOIList()) {
      this.polylineList = this.fileService.getPolylineList();
    }
    this.scaleValue = 5;
    this.gridCols = 5
  }

  ngOnInit(): void {
    this.fileService.notifyObservable$.subscribe(res => {
      if (res.refresh) {
         this.polylineList = this.fileService.getPolylineList();
      }
   })
  }

  openEditor(polylineItem: Polyline): void {
    this.router.navigate(['editor',"polyline", polylineItem.type, polylineItem.subtype ]);
  }

  formatLabel(value: number): number {
    if (value >= 1000) {
      return Math.round(value / 1000);
    }
    return value;
  }

  updateGrid(): void {
    if (this.scaleValue <= 10) {
      this.gridCols = 5;
    }
    if(this.scaleValue > 10 && this.scaleValue <= 20) {
      this.gridCols = 4;
    }
    if(this.scaleValue > 20 && this.scaleValue <= 30) {
      this.gridCols = 3;
    }
    if(this.scaleValue > 30 && this.scaleValue <= 40) {
      this.gridCols = 2;
    }
    if (this.scaleValue > 40) {
      this.gridCols = 1;
    }
  }
}
