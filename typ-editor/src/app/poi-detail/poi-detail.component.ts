import { Component, AfterViewInit, Inject, ViewChild, ElementRef } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { POI } from 'src/TYP_File_lib/TypFile_blocks/POI';

@Component({
  selector: 'app-poi-detail',
  templateUrl: './poi-detail.component.html',
  styleUrls: ['./poi-detail.component.css']
})
export class PoiDetailComponent implements AfterViewInit {

  poi: POI;

  @ViewChild('canvas', {static: false}) 
  myCanvas!: ElementRef<HTMLCanvasElement>;

  context!: CanvasRenderingContext2D | null;

  constructor(@Inject(MAT_DIALOG_DATA) private data: {poi: POI}) { 
    this.poi = data.poi;
  }

  ngAfterViewInit(): void {
    this.context = this.myCanvas.nativeElement.getContext('2d');

    if(this.context) {
      this.context.rect(0, 0, 600, 300);
      this.context.fillStyle = "#ccd5e3";
      this.context.fill();
      let bmp = this.poi.asBitmap(true);
      //this.context.putImageData(bmp.getImageData(), 300, 150);

      createImageBitmap(bmp.getImageData()).then((imgBitmap) => {
        if(this.context) {
          this.context.drawImage(imgBitmap, 20, 20, bmp.width * 10, bmp.height * 10);
        }
    });
    }
  }

}
