import { Component, ElementRef, AfterViewInit, ViewChild, Input, OnChanges, SimpleChanges } from '@angular/core';
import { GraphicElement } from 'src/TYP_File_lib/TypFile_blocks/GeneralDataBlocks/GraphicElement';
import { Effects } from './effects';

@Component({
  selector: 'app-bitmap-canvas',
  templateUrl: './bitmap-canvas.component.html',
  styleUrls: ['./bitmap-canvas.component.css']
})
export class BitmapCanvasComponent implements AfterViewInit, OnChanges {

  @Input() drawableItem!: GraphicElement;
  @Input() scaleValue!: number;
  @Input() darken!: boolean;
  @Input() effect!: Effects;
  @Input() effectColor!: string;

  darkened: boolean;

  @ViewChild('canvas', {static: false}) 
  myCanvas!: ElementRef<HTMLCanvasElement>;

  context!: CanvasRenderingContext2D | null;

  constructor() {
    this.darkened = false;
   }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['scaleValue']) {
      if(changes['scaleValue'].previousValue != undefined) {
        if(changes['scaleValue'].currentValue != changes['scaleValue'].previousValue) {
          this.drawIcon();
          this.applyEffect();
        }
      }
    }
    
    if(changes['darken']) {
      if(changes['darken'].previousValue != undefined) {
        if(changes['darken'].currentValue != changes['darken'].previousValue) {
          if(this.darkened) {
            this.drawIcon();
          }
          else {
            this.darkenCanvas();
          }
          this.darkened = !this.darkened;
        }
      }
    }
  }

  ngAfterViewInit(): void {
    this.drawIcon();
    this.applyEffect();
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
    if(this.darken) {
      this.darkenCanvas();
    }
  }

  darkenCanvas(): void {
    if(this.context) {
      this.context.fillStyle = "rgba(0, 0, 0, 0.7)";
      this.context.fillRect(0, 0, 700, 500);
    }
  }

  applyEffect(): void {
    if(this.effect != undefined) {
      switch(+this.effect) {
        case Effects.ChessBoard:
          this.drawChestBoard();
          break;
        case Effects.Horizontal:
          this.drawHorizontal();
          break;
        case Effects.Vertical:
          this.drawVertical();
          break;
        case Effects.DiagonalLeft:
          this.drawDiagonalLeft();
          break;
        case Effects.DiagonalRight:
          this.drawDiagonalRight();
          break;
        case Effects.Diamond:
          this.drawDiamond();
          break;
        case Effects.GrayScale:
          this.applyGrayScale();
          break;
        case Effects.Inverse:
          this.applyInverseColors();
          break;
      }
    }
  }

  drawChestBoard(): void {
    if(this.context) {
      const bmp = this.drawableItem.asBitmap(true);
      for(let y = 0; y < bmp.height; y++) {
        for(let x = 0; x < bmp.width; x++) {
          if ( (x + y) % 2 == 0) {
            this.context.fillStyle =  this.effectColor;
            this.context.fillRect(x *this.scaleValue, y *this.scaleValue, this.scaleValue, this.scaleValue);
            this.context.stroke();
          }
        }
      }
    }
  }

  drawHorizontal(): void {
    if(this.context) {
      const bmp = this.drawableItem.asBitmap(true);
      for(let y = 0; y < bmp.height; y++) {
        for(let x = 0; x < bmp.width; x++) {
          if (x % 2 == 0) {
            this.context.fillStyle =  this.effectColor;
            this.context.fillRect(x *this.scaleValue, y *this.scaleValue, this.scaleValue, this.scaleValue);
            this.context.stroke();
          }
        }
      }
    }
  }

  drawVertical(): void {
    if(this.context) {
      const bmp = this.drawableItem.asBitmap(true);
      for(let y = 0; y < bmp.height; y++) {
        for(let x = 0; x < bmp.width; x++) {
          if (y % 2 == 0) {
            this.context.fillStyle =  this.effectColor;
            this.context.fillRect(x *this.scaleValue, y *this.scaleValue, this.scaleValue, this.scaleValue);
            this.context.stroke();
          }
        }
      }
    }
  }

  drawDiagonalLeft(step: number = 4): void {
    if(this.context) {
      const bmp = this.drawableItem.asBitmap(true);
      this.context.fillStyle =  this.effectColor;
      for (let x = 0; x < bmp.height; x+=step) {
        for(let y = 0; y < bmp.width; y++) {
          this.context.fillRect((y) *this.scaleValue, (y + x) *this.scaleValue, this.scaleValue, this.scaleValue);
          this.context.stroke();
        }
        for(let y = 0; y < bmp.width; y++) {
          this.context.fillRect((y + x) *this.scaleValue, (y) *this.scaleValue, this.scaleValue, this.scaleValue);
          this.context.stroke();
        }
      }  
    }
  }

  drawDiagonalRight(step: number = 4): void {
    if(this.context) {
      const bmp = this.drawableItem.asBitmap(true);
      this.context.fillStyle = this.effectColor;
      for (let x = 0; x < bmp.height; x+=step) {
        for(let y = 0; y < bmp.width; y++) {
          this.context.fillRect((bmp.width - y -1) *this.scaleValue, (y + x) *this.scaleValue, this.scaleValue, this.scaleValue);
          this.context.stroke();
        }
        for(let y = 0; y < bmp.width; y++) {
          this.context.fillRect((bmp.width - x -y -1) *this.scaleValue, (y) *this.scaleValue, this.scaleValue, this.scaleValue);
          this.context.stroke();
        }
      }  
    }
  }

  drawDiamond(): void {
    this.drawDiagonalLeft(8);
    this.drawDiagonalRight(8);
  }

  applyInverseColors(): void {
    this.context = this.myCanvas.nativeElement.getContext('2d');
    if(this.context) {
      const bmp = this.drawableItem.asBitmap(true);
      bmp.inverseColors();
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

  applyGrayScale(): void {
    this.context = this.myCanvas.nativeElement.getContext('2d');
    if(this.context) {
      const bmp = this.drawableItem.asBitmap(true);
      bmp.grayScaleFilter();
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
