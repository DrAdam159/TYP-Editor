import { Component, ElementRef, AfterViewInit, ViewChild, Input, OnChanges, SimpleChanges } from '@angular/core';
import { GraphicElement } from 'src/TYP_File_lib/TypFile_blocks/GeneralDataBlocks/GraphicElement';

@Component({
  selector: 'app-bitmap-canvas',
  templateUrl: './bitmap-canvas.component.html',
  styleUrls: ['./bitmap-canvas.component.css']
})
export class BitmapCanvasComponent implements AfterViewInit, OnChanges {

  @Input() drawableItem!: GraphicElement;
  @Input() scaleValue!: number;

  @ViewChild('canvas', {static: false}) 
  myCanvas!: ElementRef<HTMLCanvasElement>;

  context!: CanvasRenderingContext2D | null;

  constructor() { }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['scaleValue'].previousValue != undefined) {
      if(changes['scaleValue'].currentValue != changes['scaleValue'].previousValue) {
        this.drawIcon();
      }
    }
  }

  ngAfterViewInit(): void {
    this.drawIcon();
  }

  drawIcon(): void {
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
