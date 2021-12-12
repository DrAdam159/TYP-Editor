import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Polyline } from 'src/TYP_File_lib/TypFile_blocks/Polyline';
import { FileService } from '../services/file.service';
import { AddPolylineComponent } from './add-polyline/add-polyline.component';

@Component({
  selector: 'app-polyline',
  templateUrl: './polyline.component.html',
  styleUrls: ['./polyline.component.css']
})
export class PolylineComponent implements OnInit {

  polylineList!: Array<Polyline>;
  scaleValue: number;
  gridCols: number;
  bitmapScale: number;

  constructor(private fileService: FileService, private matDialog: MatDialog, private router: Router) { 
    if(this.fileService.getPOIList()) {
      this.polylineList = this.fileService.getPolylineList();
    }
    this.scaleValue = 40;
    this.gridCols = (3 / this.scaleValue * 100) | 0;
    this.bitmapScale = (20 / 100 * this.scaleValue) | 0;
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
    this.bitmapScale = (20 / 100 * this.scaleValue) | 0;
    this.gridCols = (3 / this.scaleValue * 100) | 0;
  }

  addPolyline(): void {
    this.matDialog.open(AddPolylineComponent);
  }
}
