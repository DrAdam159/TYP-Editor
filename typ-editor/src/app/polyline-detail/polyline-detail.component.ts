import { Component, AfterViewInit, Inject, ViewChild, ElementRef } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Polyline } from 'src/TYP_File_lib/TypFile_blocks/Polyline';
import { Router } from '@angular/router';

@Component({
  selector: 'app-polyline-detail',
  templateUrl: './polyline-detail.component.html',
  styleUrls: ['./polyline-detail.component.css']
})
export class PolylineDetailComponent implements AfterViewInit {

  polyline: Polyline;

  @ViewChild('canvas', {static: false}) 
  myCanvas!: ElementRef<HTMLCanvasElement>;

  context!: CanvasRenderingContext2D | null;

  constructor(@Inject(MAT_DIALOG_DATA) private data: {polyline: Polyline}, private router: Router) {
    this.polyline = data.polyline;
   }

  ngAfterViewInit(): void {
    this.context = this.myCanvas.nativeElement.getContext('2d');

    if(this.context) {
      let bmp = this.polyline.asBitmap(true);
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
    this.router.navigate(['/editor'], {state:{...this.polyline} });
  }

}
