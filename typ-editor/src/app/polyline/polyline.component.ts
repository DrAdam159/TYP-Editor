import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { TypFile } from 'src/TYP_File_lib/TypFile';
import { GraphicElement } from 'src/TYP_File_lib/TypFile_blocks/GeneralDataBlocks/GraphicElement';
import { Polyline } from 'src/TYP_File_lib/TypFile_blocks/Polyline';
import { GridSelectComponent } from '../grid-select/grid-select.component';
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

  delete: boolean;
  selectedItems: Array<GraphicElement>;

  constructor(private fileService: FileService, private matDialog: MatDialog, private router: Router, private titleService: Title) { 
    this.titleService.setTitle('Polylines');
    if(this.fileService.getPOIList()) {
      this.polylineList = this.fileService.getPolylineList();
    }
    this.scaleValue = 40;
    this.gridCols = (3 / this.scaleValue * 100) | 0;
    this.bitmapScale = (20 / 100 * this.scaleValue) | 0;
    this.delete = false;
    this.selectedItems = new Array();
  }

  ngOnInit(): void {
    this.fileService.notifyObservable$.subscribe(res => {
      if (res.refresh) {
         this.polylineList = this.fileService.getPolylineList();
      }
   })
  }

  openEditor(polylineItem: Polyline, tabIndex: number): void {
    this.router.navigate(['polyline/editor',"polyline", polylineItem.type, polylineItem.subtype, tabIndex  ]);
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
            toMerge: 'polyline',
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
    this.fileService.deleteItems('polyline', this.selectedItems);
    this.switchToDelete();
    this.polylineList = this.fileService.getPolylineList();
  }
}
