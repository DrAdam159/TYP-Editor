import { Component, OnInit, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Polygon } from 'src/TYP_File_lib/TypFile_blocks/Polygon';
import { FileService } from '../services/file.service';
import { AddPolygoneComponent } from './add-polygone/add-polygone.component';

@Component({
  selector: 'app-polygone',
  templateUrl: './polygone.component.html',
  styleUrls: ['./polygone.component.css']
})
export class PolygoneComponent implements OnInit {

  polygoneList!: Array<Polygon>;
  scaleValue: number;
  gridCols: number;
  bitmapScale: number;

  constructor(private fileService: FileService, private matDialog: MatDialog, private router: Router) { 
    if(this.fileService.getPOIList()) {
      this.polygoneList = this.fileService.getPolygoneList();
    }
    this.scaleValue = 40;
    this.gridCols = (3 / this.scaleValue * 100) | 0;
    this.bitmapScale = (20 / 100 * this.scaleValue) | 0;
  }

  ngOnInit(): void {
  }

  openEditor(polygoneItem: Polygon): void {
    this.router.navigate(['editor',"polygone", polygoneItem.type, polygoneItem.subtype ]);
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

  addPolygone(): void {
    this.matDialog.open(AddPolygoneComponent);
  }
}
