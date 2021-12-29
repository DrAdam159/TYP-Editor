import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TypFile } from 'src/TYP_File_lib/TypFile';
import { GraphicElement } from 'src/TYP_File_lib/TypFile_blocks/GeneralDataBlocks/GraphicElement';
import { FileService } from '../services/file.service';

@Component({
  selector: 'app-grid-select',
  templateUrl: './grid-select.component.html',
  styleUrls: ['./grid-select.component.css']
})
export class GridSelectComponent implements OnInit {

  itemList: Array<GraphicElement>;
  selectedItems: Array<GraphicElement>;
  scaleValue: number;
  gridCols: number;
  bitmapScale: number;
  itemType: string;
  fileToMerge: TypFile;

  darken: boolean;

  constructor(@Inject(MAT_DIALOG_DATA) private data: {file: TypFile, toMerge: string}, private fileService: FileService, private dialogRef: MatDialogRef<GridSelectComponent>) { 
    this.scaleValue = 40;
    this.gridCols = (3 / this.scaleValue * 100) | 0;
    this.bitmapScale = (20 / 100 * this.scaleValue) | 0;
    this.selectedItems = new Array();
    this.itemType = data.toMerge;
    this.fileToMerge = data.file;
    this.darken = false;
    switch(this.itemType) {
      case 'polyline':
        this.itemList = data.file.PolylineList;
        break;
      case 'poi':
        this.itemList = data.file.POIList;
        break;
      case 'polygone':
        this.itemList = data.file.PolygonList;
        break;
      default:
        this.itemList = new Array();
    }
  }

  ngOnInit(): void {
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

  select(item: GraphicElement): void {
    this.selectedItems.push(item);
    //this.darken = true;
  }

  mergeItems(): void{
    this.fileService.mergeItems(this.itemType, this.selectedItems, this.fileToMerge);
    this.dialogRef.close();
  }

  highlightTile(item: GraphicElement): boolean {
    if(this.selectedItems.indexOf(item) != -1) {
      return true;
    }
    return false;
  }

}
