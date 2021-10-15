import { Component, AfterViewInit, Inject, ViewChild, ElementRef } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Polygon } from 'src/TYP_File_lib/TypFile_blocks/Polygon';

@Component({
  selector: 'app-polygone-detail',
  templateUrl: './polygone-detail.component.html',
  styleUrls: ['./polygone-detail.component.css']
})
export class PolygoneDetailComponent implements AfterViewInit {

  polygone: Polygon;

  @ViewChild('canvas', {static: false}) 
  myCanvas!: ElementRef<HTMLCanvasElement>;

  context!: CanvasRenderingContext2D | null;

  constructor(@Inject(MAT_DIALOG_DATA) private data: {polygone: Polygon}) { 
    this.polygone = data.polygone;
  }

  ngAfterViewInit(): void {
    this.context = this.myCanvas.nativeElement.getContext('2d');

    if(this.context) {
      this.context.rect(0, 0, 600, 400);
      this.context.fillStyle = "#ccd5e3";
      this.context.fill();
      let bmp = this.polygone.asBitmap(true);
      //this.context.putImageData(bmp.getImageData(), 300, 150);

      createImageBitmap(bmp.getImageData()).then((imgBitmap) => {
        if(this.context) {
          this.context.drawImage(imgBitmap, 20, 20, bmp.width * 10, bmp.height * 10);
        }
    });
    }
  }
}
