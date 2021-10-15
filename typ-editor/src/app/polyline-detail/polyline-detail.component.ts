import { Component, AfterViewInit, Inject, ViewChild, ElementRef } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Polyline } from 'src/TYP_File_lib/TypFile_blocks/Polyline';
import { Router, NavigationExtras } from '@angular/router';
import { connectableObservableDescriptor } from 'rxjs/internal/observable/ConnectableObservable';

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
      this.context.rect(0, 0, 600, 300);
      this.context.fillStyle = "#ccd5e3";
      this.context.fill();
      let bmp = this.polyline.asBitmap(true);
      //this.context.putImageData(bmp.getImageData(), 300, 150);

      createImageBitmap(bmp.getImageData()).then((imgBitmap) => {
        if(this.context) {
          this.context.drawImage(imgBitmap, 20, 20, bmp.width * 10, bmp.height * 10);
        }
    });
    }
  }

  openEditor(): void {
    /*let navigationExtras: NavigationExtras = {
      queryParams: {
          data: this.polyline
      }
    }
    this.router.navigate(['editor'], navigationExtras);*/
    this.router.navigateByUrl('/editor', { state: { data: this.polyline } });
  }

}
