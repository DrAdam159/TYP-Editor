import { Component, AfterViewInit, Inject, ViewChild, ElementRef } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
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

  constructor(@Inject(MAT_DIALOG_DATA) private data: {polygone: Polygon}, private router: Router) { 
    this.polygone = data.polygone;
  }

  ngAfterViewInit(): void {
    this.context = this.myCanvas.nativeElement.getContext('2d');

    if(this.context) {
      let bmp = this.polygone.asBitmap(true);
      this.context.canvas.width = bmp.width *10;
      this.context.canvas.height = bmp.height *10;
      

      createImageBitmap(bmp.getImageData()).then((imgBitmap) => {
        if(this.context) {
          this.context.drawImage(imgBitmap, 0, 0, bmp.width * 10, bmp.height * 10);
        }
    });
    }
  }

  openEditor(): void {
    //this.router.navigate(['/editor'], {state:{...this.polyline} });
    this.router.navigate(['/editor'], {state:{polyline: null, poi: null, polygone: this.polygone} });
  }
}
