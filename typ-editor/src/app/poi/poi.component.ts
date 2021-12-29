import { Component, OnInit, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TypFile } from 'src/TYP_File_lib/TypFile';
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

  constructor(private fileService: FileService, private matDialog: MatDialog, private router: Router) { 
   if(this.fileService.getPOIList()) {
      this.poiList = this.fileService.getPOIList();
    }
    this.scaleValue = 40;
    this.gridCols = (3 / this.scaleValue * 100) | 0;
    this.bitmapScale = (25 / 100 * this.scaleValue) | 0;
  }

  ngOnInit(): void {
  }

  openEditor(poiItem: POI): void {
    this.router.navigate(['editor',"poi", poiItem.type, poiItem.subtype ]);
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
          }
        });
      };

      reader.onerror = () => {
        console.log(reader.error);
      };
    }
  }

}
