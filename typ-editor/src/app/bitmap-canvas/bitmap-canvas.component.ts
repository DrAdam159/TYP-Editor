import { Component, ElementRef, AfterViewInit, ViewChild, Input } from '@angular/core';
import { GraphicElement } from 'src/TYP_File_lib/TypFile_blocks/GeneralDataBlocks/GraphicElement';

@Component({
  selector: 'app-bitmap-canvas',
  templateUrl: './bitmap-canvas.component.html',
  styleUrls: ['./bitmap-canvas.component.css']
})
export class BitmapCanvasComponent implements AfterViewInit {

  @Input() drawableItem!: GraphicElement;
  @Input() scaleValue!: number;

  @ViewChild('canvas', {static: false}) 
  myCanvas!: ElementRef<HTMLCanvasElement>;

  context!: CanvasRenderingContext2D | null;

  constructor() { }

  ngAfterViewInit(): void {
    this.context = this.myCanvas.nativeElement.getContext('2d');

    if(this.context) {
      let bmp = this.drawableItem.asBitmap(true);
      this.context.canvas.width = bmp.width *this.scaleValue;
      this.context.canvas.height = bmp.height *this.scaleValue;

      createImageBitmap(bmp.getImageData()).then((imgBitmap) => {
        if(this.context) {
          this.context.drawImage(imgBitmap, 0, 0, bmp.width * 10, bmp.height * 10);
        }
    });
    }
  }

}
