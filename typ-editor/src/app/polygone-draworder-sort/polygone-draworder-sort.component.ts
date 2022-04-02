import { Component, OnInit, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Polygon } from 'src/TYP_File_lib/TypFile_blocks/Polygon';
import { FileService } from '../services/file.service';
import {CdkDragDrop, CdkDropList, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';
import { Title } from '@angular/platform-browser';

interface Draworder {
  draworderValue: number;
  items: Array<Polygon>;
}

@Component({
  selector: 'app-polygone-draworder-sort',
  templateUrl: './polygone-draworder-sort.component.html',
  styleUrls: ['./polygone-draworder-sort.component.css']
})
export class PolygoneDraworderSortComponent implements OnInit {

  polygoneList!: Array<Polygon>;
  scaleValue: number;
  gridCols: number;
  bitmapScale: number;


  draworders: Array<Draworder>;

  constructor(private fileService: FileService, private matDialog: MatDialog, private router: Router, private titleService: Title) { 
    this.titleService.setTitle('DrawOrder');
    if(this.fileService.getPolygoneList()) {
      this.polygoneList = this.fileService.getPolygoneList();
      const half = Math.ceil(this.polygoneList.length / 2);
    }
    this.scaleValue = 15;
    this.gridCols = (3 / this.scaleValue * 100) | 0;
    this.bitmapScale = (20 / 100 * this.scaleValue) | 0;
    this.draworders = new Array();
  }

  ngOnInit(): void {
    this.createDraworders();
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

  drop(event: CdkDragDrop<Polygon[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
      this.updateDraworder();
      this.fileService.updateFile();
      //console.log(this.draworders);
    }
  }

  createDraworders(): void {
    this.polygoneList.forEach((item, index) => {
      this.insertDraworderItem(item);
    })

    this.draworders.sort(function(a, b) {
      return a.draworderValue - b.draworderValue;
    });
  }

  insertDraworderItem(item: Polygon): void {
    if((this.draworders.some(e => e.draworderValue == item.drawOrder))) {
      this.draworders.find(e => e.draworderValue == item.drawOrder)?.items.push(item);
    }
    else {
      const tmpArr = new Array<Polygon>();
      tmpArr.push(item);
      this.draworders.push({draworderValue: item.drawOrder , items: tmpArr});
    }
  }

  updateDraworder(): void {
    this.draworders.forEach((item, index) => {
      item.items.forEach((subItem, index) => {
        subItem.drawOrder = item.draworderValue;
      })
    })
  }

}
