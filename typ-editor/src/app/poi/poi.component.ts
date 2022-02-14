import { Component, OnInit, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TypFile } from 'src/TYP_File_lib/TypFile';
import { GraphicElement } from 'src/TYP_File_lib/TypFile_blocks/GeneralDataBlocks/GraphicElement';
import { POI } from 'src/TYP_File_lib/TypFile_blocks/POI';
import { GridSelectComponent } from '../grid-select/grid-select.component';
import { FileService } from '../services/file.service';
import { AddPoiComponent } from './add-poi/add-poi.component';

@Component({
  selector: 'app-poi',
  templateUrl: './poi.component.html',
  styleUrls: ['./poi.component.css']
})
export class PoiComponent implements OnInit {

  poiList!: Array<POI>;
  scaleValue: number;
  gridCols: number;
  bitmapScale: number;

  delete: boolean;
  selectedItems: Array<GraphicElement>;

  constructor(private fileService: FileService, private matDialog: MatDialog, private router: Router) { 
   if(this.fileService.getPOIList()) {
      this.poiList = this.fileService.getPOIList();
    }
    this.scaleValue = 40;
    this.gridCols = (3 / this.scaleValue * 100) | 0;
    this.bitmapScale = (25 / 100 * this.scaleValue) | 0;
    this.delete = false;
    this.selectedItems = new Array();
  }

  ngOnInit(): void {
  }

  openEditor(poiItem: POI, tabIndex: number): void {
    this.router.navigate(['poi/editor',"poi", poiItem.type, poiItem.subtype, tabIndex ]);
  }

  formatLabel(value: number): number {
    if (value >= 1000) {
      return Math.round(value / 1000);
    }
    return value;
  }

  updateGrid(): void {
    this.bitmapScale = (25 / 100 * this.scaleValue) | 0;
    this.gridCols = (3 / this.scaleValue * 100) | 0;
  }

  addPOI(): void {
    this.matDialog.open(AddPoiComponent);
  }

  handleFileInput(event: any): void {
    const fileToUpload: File = event.target.files[0];

    if (fileToUpload) {

      const reader = new FileReader();
     
      reader.readAsArrayBuffer(fileToUpload);

      reader.onload = () => {
        const buffer = reader.result as ArrayBuffer;
        const view = new DataView(buffer);

        const typFile: TypFile = new TypFile(view);
        this.matDialog.open( GridSelectComponent, {
          data: {
            file: typFile,
            toMerge: 'poi',
          },
          minWidth: '80vw',
        });
      };

      reader.onerror = () => {
        console.log(reader.error);
      };
    }
  }

  switchToDelete(): void {
    this.delete = !this.delete;
    this.selectedItems.splice(0, this.selectedItems.length);
  }

  select(item: GraphicElement): void {
    if(this.selectedItems.find(x => x.type === item.type && x.subtype == item.subtype)) {
      console.log('remove');
      this.selectedItems = this.selectedItems.filter(x => x.type + '' + x.subtype  != item.type + '' + x.subtype);
    }
    else {
      this.selectedItems.push(item);
    }  
    console.log(this.selectedItems);
  }

  highlightTile(item: GraphicElement): boolean {
    if(this.selectedItems.indexOf(item) != -1) {
      return true;
    }
    return false;
  }

  deleteIcons(): void {
    this.fileService.deleteItems('poi', this.selectedItems);
    this.switchToDelete();
    this.poiList = this.fileService.getPOIList();
  }

}
