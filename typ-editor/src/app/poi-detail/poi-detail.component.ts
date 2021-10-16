import { Component, AfterViewInit, Inject, ViewChild, ElementRef } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { POI } from 'src/TYP_File_lib/TypFile_blocks/POI';
import { Router } from '@angular/router';

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

  constructor(@Inject(MAT_DIALOG_DATA) private data: {poi: POI}, private router: Router) { 
    this.poi = data.poi;
  }

  ngAfterViewInit(): void {
    this.context = this.myCanvas.nativeElement.getContext('2d');

    if(this.context) {
      let bmp = this.poi.asBitmap(true);
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
    this.router.navigate(['/editor'], {state:{polyline: null, poi: this.poi, polygone: null} });
  }

}
