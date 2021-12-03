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
      const bmp = this.drawableItem.asBitmap(true);
      this.context.canvas.width = bmp.width * this.scaleValue;
      this.context.canvas.height = bmp.height * this.scaleValue;

      for(let y = 0; y < bmp.height; y++) {
        for(let x = 0; x < bmp.width; x++) {
          this.context.beginPath();
          this.context.fillStyle =  bmp.getPixelColor(x, y).toRgba();
          this.context.fillRect(x *this.scaleValue, y *this.scaleValue, this.scaleValue, this.scaleValue);
          this.context.stroke();
        }
      }
    }
  }

}
