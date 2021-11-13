import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GraphicElement } from 'src/TYP_File_lib/TypFile_blocks/GeneralDataBlocks/GraphicElement';
import { FileService } from '../services/file.service';
import { fromEvent, Subscription, zip } from 'rxjs';
import { switchMap, takeUntil, pairwise } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { Bitmap } from 'src/TYP_File_lib/Utils/Bitmap';
import { Color } from 'src/TYP_File_lib/Utils/Color';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css']
})
export class EditorComponent implements OnInit, AfterViewInit {

  drawableItem!: GraphicElement;
  //prave vykreslena bitmapa
  itemBitmap!: Bitmap;
  //list Bitmap pro undo a redo operace
  undoQuery: Array<Bitmap>;
  redoQuery: Array<Bitmap>;

  sub: any;

  @ViewChild('canvas', {static: false}) 
  myCanvas!: ElementRef<HTMLCanvasElement>;
  context!: CanvasRenderingContext2D | null;

  //kolikrat bude kazdy pixel zvetseny
  scaleNum: number;

  //jaky nastroj uzivatel zvolil
  toolOptions: FormControl;
  //subscription mouse eventu
  mouseSub!: Subscription;

  //indikuje pocatecni vykresleni cary
  lineStart: boolean;
  //poceteni souradnice cary
  lineStartX: number;
  lineStartY: number;

  //souradnice posledniho navstiveneho ctverecku pri vykresleni
  //porovnani vuci vypoctu soucasne pozice kurzoru zabrani duplicitnimu kresleni
  x:number
  y:number;

  //brava z colorPickeru
  color: string;

  constructor(private fileService: FileService, private Activatedroute: ActivatedRoute) {
    this.scaleNum = 20;
    this.undoQuery = new Array();
    this.redoQuery = new Array();
    this.lineStart = false;
    this.lineStartX = 0;
    this.lineStartY = 0;
    this.x = 0;
    this.y = 0;
    this.color = '#3f51b5';
    this.toolOptions = new FormControl();
   }

  setColor(){
    if (!this.context) {
      return;
    }
    this.context.fillStyle = this.color;
  }

  ngOnInit(): void {
    
    this.sub = this.Activatedroute.paramMap.subscribe(params => { 
      let itemType = params.get('id');
      let typeID = params.get('id1');
      let subTypeID = params.get('id2');

      if(itemType && typeID && subTypeID) {
        switch(itemType) {
          case 'polyline':
            this.drawableItem = this.fileService.getPolyline(~~typeID, ~~subTypeID);
            break;
          case 'polygone':
            this.drawableItem = this.fileService.getPolygone(~~typeID, ~~subTypeID);
            break;
          case 'poi':
            this.drawableItem = this.fileService.getPOI(~~typeID, ~~subTypeID);
            break;
          default:
            new Error("No item type supplied!");
        }
      }
   });
  }

  ngAfterViewInit(): void {
    this.context = this.myCanvas.nativeElement.getContext('2d');
    if(this.drawableItem) {
      this.itemBitmap = this.drawableItem.asBitmap(true);
    }
    this.drawBitmapWithGrid();
    this.storeBitmap();
  }

  stopToolUse(): void {
    if(this.mouseSub) {
      this.mouseSub.unsubscribe();
      this.lineStart = false;
    }
  }

  useBrush(): void {
    this.stopToolUse();
    const canvasEl: HTMLCanvasElement = this.myCanvas?.nativeElement;
    this.captureMouseMoveEventOnClick(canvasEl, 'brush');
  }

  useLine(): void {
    this.stopToolUse();
    const canvasEl: HTMLCanvasElement = this.myCanvas?.nativeElement;
    this.captureMouseMoveEventOnClick(canvasEl, 'line');
  }

  useFill(): void {
    this.stopToolUse();
    const canvasEl: HTMLCanvasElement = this.myCanvas?.nativeElement;
    this.captureEventOnClick(canvasEl);
  }

  useFilledRectangle(): void {
    this.stopToolUse();
    const canvasEl: HTMLCanvasElement = this.myCanvas?.nativeElement;
    this.captureMouseMoveEventOnClick(canvasEl, 'filled_rectangle');
  }

  useRectangle(): void {
    this.stopToolUse();
    const canvasEl: HTMLCanvasElement = this.myCanvas?.nativeElement;
    this.captureMouseMoveEventOnClick(canvasEl, 'rectangle');
  }

  useFilledCircle(): void {
    this.stopToolUse();
    const canvasEl: HTMLCanvasElement = this.myCanvas?.nativeElement;
    this.captureMouseMoveEventOnClick(canvasEl, 'filled_circle');
  }

  useCircle(): void {
    this.stopToolUse();
    const canvasEl: HTMLCanvasElement = this.myCanvas?.nativeElement;
    this.captureMouseMoveEventOnClick(canvasEl, 'circle');
  }

  flipVertically(): void {
    this.stopToolUse();
    this.flipImageVertically();
  }

  flipHorizontally(): void {
    this.stopToolUse();
    this.flipImageHorizontally();
  }

  rotateLeft(): void {
    this.stopToolUse();
    this.rotateImageLeft();
  }

  private captureMouseMoveEventOnClick(canvasEl: HTMLCanvasElement, tool: String) {
    this.mouseSub = fromEvent(canvasEl, 'mousedown')
      .pipe(
        switchMap(e => {
          return fromEvent(canvasEl, 'mousemove').pipe(
            takeUntil(fromEvent(canvasEl, 'mouseup')),
            takeUntil(fromEvent(canvasEl, 'mouseleave')),
            pairwise()
          );
        })
      )
      .subscribe((res) => {
        const rect = canvasEl.getBoundingClientRect();
        const prevMouseEvent = res[0] as MouseEvent;
        const currMouseEvent = res[1] as MouseEvent;

        const prevPos = {
          x: prevMouseEvent.clientX - rect.left,
          y: prevMouseEvent.clientY - rect.top
        };

        const currentPos = {
          x: currMouseEvent.clientX - rect.left,
          y: currMouseEvent.clientY - rect.top
        };

        if(this.lineStart == false) {
          this.lineStartX =  prevPos.x;
          this.lineStartY = prevPos.y;
          this.lineStart = true;
        }

        switch(tool) {
          case 'brush':
            this.interpolateLine(prevPos, currentPos);
            break;
          case 'line':
            
            this.drawLine({x: this.lineStartX, y: this.lineStartY}, currentPos);
            break;
          case 'fill':
            this.fillColor(currentPos);
            break;
          case 'rectangle':
            this.drawRectangle({x: this.lineStartX, y: this.lineStartY}, currentPos);
            break;
          case 'filled_rectangle':
            this.drawFilledRectangle({x: this.lineStartX, y: this.lineStartY}, currentPos);
            break;
          case 'filled_circle':
            this.drawFilledCircle({x: this.lineStartX, y: this.lineStartY}, currentPos);
            break;
          case 'circle':
            this.drawCircle({x: this.lineStartX, y: this.lineStartY}, currentPos);
            break;
        }
      });
  }

  private captureEventOnClick(canvasEl: HTMLCanvasElement) {
    this.mouseSub = fromEvent(canvasEl, 'mousedown').subscribe((res) => {
      const rect = canvasEl.getBoundingClientRect();
      const currMouseEvent = res as MouseEvent;

      const currentPos = {
        x: currMouseEvent.clientX - rect.left,
        y: currMouseEvent.clientY - rect.top
      };
      
      this.fillColor(currentPos);
    });
  }

  convertCoordinates(coordinates: { x: number; y: number }) {
    let rw = coordinates.x - 1;
    let rh = coordinates.y - 1;
    rw = (rw - rw % this.scaleNum) / this.scaleNum ;
    rh = (rh - rh % this.scaleNum) / this.scaleNum;

    return {x: rw, y: rh};
  }
  
  private positionChange(currentPos: { x: number; y: number }): boolean {
    let rw2 = currentPos.x - 1;
    let rh2 = currentPos.y - 1;
    rw2 = rw2 - rw2 % this.scaleNum;
    rh2 = rh2 - rh2 % this.scaleNum;
    if(rw2 == this.x && rh2 == this.y) {
      return false;
    }
    this.x = rw2;
    this.y = rh2;
    
    return true;
  }

  private interpolateLine(prevPos: { x: number; y: number }, currentPos: { x: number; y: number }): void {
    if (!this.context) {
      return;
    }

    for (let pct = 0; pct <= 1; pct += 0.03) {
      let dx = currentPos.x - prevPos.x;
      let dy = currentPos.y - prevPos.y;
      let X = prevPos.x + dx * pct;
      let Y = prevPos.y + dy * pct;
      if (this.positionChange({x: X, y:Y})) {
          this.drawColorCell(X, Y);
      }
    }
  }

  updateBitmap(): void{
    if (!this.context) {
      return;
    }
    this.drawBitmapWithGrid();
  }

  drawBitmapWithGrid(): void {
    if(this.itemBitmap && this.context) {
      if(this.context) {
        this.context.canvas.width = this.itemBitmap.width *this.scaleNum;
        this.context.canvas.height = this.itemBitmap.height *this.scaleNum;

      for(let y = 0; y < this.itemBitmap.height; y++) {
        for(let x = 0; x < this.itemBitmap.width; x++) {
          this.context.beginPath();
          this.context.fillStyle =  this.itemBitmap.getPixelColor(x, y).toRgba();
          this.context.fillRect(x *this.scaleNum, y *this.scaleNum, this.scaleNum, this.scaleNum);
          this.context.stroke();
        }
      }
      this.drawGrid(this.itemBitmap.width *this.scaleNum, this.itemBitmap.height*this.scaleNum);
      }
    }
  }

  private drawGrid(width: number, height: number): void {
    if (!this.context) {
      return;
    }

    this.context.strokeStyle = "#FF0000";

    for(let y = 0; y < height; y++) {
      this.context.beginPath();
      this.context.moveTo(0, y *this.scaleNum);
      this.context.lineTo( width, y *this.scaleNum);
      this.context.stroke();
    }

    for(let x = 0; x < width; x++) {
      
      this.context.beginPath();
      this.context.moveTo(x *this.scaleNum, 0);
      this.context.lineTo(x *this.scaleNum, height);
      this.context.stroke();
    }
  }

  private drawColorCell(x: number, y: number): void {
    if (!this.context) {
      return;
    }
    let rw = x - 1;
    let rh = y - 1;
    rw = rw - rw % this.scaleNum;
    rh = rh - rh % this.scaleNum;
    this.context.fillStyle = this.color;
    this.context.fillRect(rw, rh, this.scaleNum, this.scaleNum);
  }

  private drawColorCell2(x: number, y: number): void {
    if (!this.context) {
      return;
    }
    this.context.fillStyle = this.color;
    this.context.fillRect(x, y, this.scaleNum, this.scaleNum);
  }

  private drawLine(prevPos: { x: number; y: number }, currentPos: { x: number; y: number }): void {
    if (!this.context) {
      return;
    }
    this.updateBitmap();
    this.interpolateLine(prevPos, currentPos);
  }

  private fillColor(currentPos: { x: number; y: number }): void {
    if(this.itemBitmap && this.context) {
      let rw = currentPos.x - 1;
      let rh = currentPos.y - 1;
      rw = (rw - rw % this.scaleNum) / this.scaleNum;
      rh = (rh - rh % this.scaleNum) / this.scaleNum;
      this.storeBitmap();
      this.itemBitmap.fill(rw, rh, new Color(this.color));
      this.updateBitmap();
    }
  }

  private drawRectangle(prevPos: { x: number; y: number }, currentPos: { x: number; y: number }): void {
    if (!this.context) {
      return;
    }
    this.updateBitmap();
    this.interpolateLine(prevPos, { x: currentPos.x, y: prevPos.y });
    this.interpolateLine(prevPos, { x: prevPos.x, y: currentPos.y });
    this.interpolateLine({ x: currentPos.x, y: prevPos.y }, currentPos);
    this.interpolateLine({ x: prevPos.x, y: currentPos.y }, { x: currentPos.x, y: currentPos.y });
  }

  private drawFilledRectangle(prevPos: { x: number; y: number }, currentPos: { x: number; y: number }): void {
    if (!this.context) {
      return;
    }

    let prevCoordinates = this.convertCoordinates(prevPos);
    let curCoordinates = this.convertCoordinates(currentPos);
    this.updateBitmap();
    let top = prevCoordinates.y,
        bottom =  curCoordinates.y,
        left   = prevCoordinates.x,
        right  =  curCoordinates.x;
    if(prevCoordinates.y < curCoordinates.y) {
        top = prevCoordinates.y;
        bottom =  curCoordinates.y;
    }
    else {
      top =  curCoordinates.y;
      bottom = prevCoordinates.y;
    }

    if(prevCoordinates.x < curCoordinates.x) {
      left = prevCoordinates.x;
      right =  curCoordinates.x;
    }
    else {
      left =  curCoordinates.x;
      right = prevCoordinates.x;
    }
    for (let y = top; y <= bottom; y++) {
      for (let x = left; x <= right; x++) {
          this.drawColorCell2(x * this.scaleNum, y * this.scaleNum );
      }
    }
  }

  private inside_circle(center: { x: number; y: number }, tile: { x: number; y: number }, radius: number): boolean {
    let dx = center.x - tile.x,
        dy = center.y - tile.y;
    let distance = Math.sqrt(dx*dx + dy*dy);

    return distance <= radius;
  }

  drawFilledCircle(prevPos: { x: number; y: number }, currentPos: { x: number; y: number }): void {
    let centerCoordinates = this.convertCoordinates(prevPos);
    let curCoordinates = this.convertCoordinates(currentPos);

    let radius = Math.sqrt((curCoordinates.x - centerCoordinates.x) * (curCoordinates.x - centerCoordinates.x) +
                            (curCoordinates.y - centerCoordinates.y) * (curCoordinates.y - centerCoordinates.y)
    );

    let top = Math.floor(centerCoordinates.y - radius),
        bottom =  Math.ceil(centerCoordinates.y + radius),
        left   = Math.floor(centerCoordinates.x - radius),
        right  =  Math.ceil(centerCoordinates.x + radius);

    this.updateBitmap();

    for (let y = top; y <= bottom; y++) {
        for (let x = left; x <= right; x++) {
            if (this.inside_circle(centerCoordinates, { x: x, y: y }, radius)) {
              this.drawColorCell2(x * this.scaleNum, y * this.scaleNum);
            }
        }
    }
  }  

  drawCircle(prevPos: { x: number; y: number }, currentPos: { x: number; y: number }): void {
    let centerCoordinates = this.convertCoordinates(prevPos);
    let curCoordinates = this.convertCoordinates(currentPos);

    let radius = Math.sqrt((curCoordinates.x - centerCoordinates.x) * (curCoordinates.x - centerCoordinates.x) +
                            (curCoordinates.y - centerCoordinates.y) * (curCoordinates.y - centerCoordinates.y)
    );

    this.updateBitmap();

    for (let r = 0; r <= Math.floor(radius * Math.sqrt(0.5)); r++) {
      let d = Math.floor(Math.sqrt(radius*radius - r*r));
      this.drawColorCell2((centerCoordinates.x - d) * this.scaleNum, (centerCoordinates.y + r) * this.scaleNum);
      this.drawColorCell2((centerCoordinates.x + d) * this.scaleNum, (centerCoordinates.y + r) * this.scaleNum);
      this.drawColorCell2((centerCoordinates.x - d) * this.scaleNum, (centerCoordinates.y - r) * this.scaleNum);
      this.drawColorCell2((centerCoordinates.x + d) * this.scaleNum, (centerCoordinates.y - r) * this.scaleNum);
      this.drawColorCell2((centerCoordinates.x + r) * this.scaleNum, (centerCoordinates.y - d) * this.scaleNum);
      this.drawColorCell2((centerCoordinates.x + r) * this.scaleNum, (centerCoordinates.y + d) * this.scaleNum);
      this.drawColorCell2((centerCoordinates.x - r) * this.scaleNum, (centerCoordinates.y - d) * this.scaleNum);
      this.drawColorCell2((centerCoordinates.x - r) * this.scaleNum, (centerCoordinates.y + d) * this.scaleNum);
    }
  }  

  flipImageVertically(): void {
    let bitmapCopy: Bitmap = new Bitmap(this.itemBitmap.width, this.itemBitmap.height);
    for(let x = 0; x < this.itemBitmap.width; x++) {
      for(let y = 0; y < this.itemBitmap.height; y++) {
        let yp = this.itemBitmap.height - y - 1;
        bitmapCopy.setPixel(x,y, this.itemBitmap.getPixelColor(x,yp));
      }
    }
   
    this.itemBitmap = bitmapCopy;
    this.updateBitmap();
  }

  flipImageHorizontally(): void {
    let bitmapCopy: Bitmap = new Bitmap(this.itemBitmap.width, this.itemBitmap.height);
    for(let x = 0; x < this.itemBitmap.width; x++) {
      for(let y = 0; y < this.itemBitmap.height; y++) {
        let xp = this.itemBitmap.width - x - 1;
        bitmapCopy.setPixel(x,y, this.itemBitmap.getPixelColor(xp,y));
      }
    }
   
    this.itemBitmap = bitmapCopy;
    this.updateBitmap();
  }

  rotateImageLeft(): void {
    let bitmapCopy: Bitmap = new Bitmap(this.itemBitmap.width, this.itemBitmap.height);
    for(let x = 0; x < this.itemBitmap.width; x++) {
      for(let y = 0; y < this.itemBitmap.height; y++) {
        let yp = this.itemBitmap.height - y - 1;
        bitmapCopy.setPixel(x,y, this.itemBitmap.getPixelColor(yp,x));
      }
    }
   
    this.itemBitmap = bitmapCopy;
    this.updateBitmap();
  }

  private storeBitmap(): void {
    const clone = new Bitmap(this.itemBitmap.width, this.itemBitmap.height);
    clone.copyData(this.itemBitmap.pixelArr);
    this.undoQuery.push(clone);
  }

  undo(): void {
    let tmp = this.undoQuery.pop();
    if(tmp) {
      this.redoQuery.push(tmp);
    }
    this.itemBitmap = this.undoQuery[this.undoQuery.length -1];
    this.updateBitmap();
  }

  redo(): void {
    let tmp = this.redoQuery.pop();
    if(tmp) {
      this.undoQuery.push(tmp);
    }
    this.itemBitmap = this.redoQuery[this.redoQuery.length -1];
    this.updateBitmap();
  }
}
