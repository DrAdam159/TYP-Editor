import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GraphicElement } from 'src/TYP_File_lib/TypFile_blocks/GeneralDataBlocks/GraphicElement';
import { FileService } from 'src/app/services/file.service';
import { fromEvent, Subscription } from 'rxjs';
import { switchMap, takeUntil, pairwise } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { Bitmap } from 'src/TYP_File_lib/Utils/Bitmap';
import { Color } from 'src/TYP_File_lib/Utils/Color';


@Component({
  selector: 'app-icon-editor',
  templateUrl: './icon-editor.component.html',
  styleUrls: ['./icon-editor.component.css']
})
export class IconEditorComponent implements OnInit, AfterViewInit {

  drawableItem!: GraphicElement;
  //prave vykreslena bitmapa
  itemBitmap!: Bitmap;
  //list Bitmap pro undo a redo operace
  undoQuery: Array<Bitmap>;
  redoQuery: Array<Bitmap>;

  itemType: string;
  typeID: string;
  subTypeID: string;

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
  mouseUpSub!: Subscription;

  //indikuje pocatecni vykresleni cary
  lineStart: boolean;
  //poceteni souradnice cary
  lineStartX: number;
  lineStartY: number;

  //souradnice posledniho navstiveneho ctverecku pri vykresleni
  //porovnani vuci vypoctu soucasne pozice kurzoru zabrani duplicitnimu kresleni
  x:number;
  y:number;

  //brava z colorPickeru
  color: string;

  //zmenene pixely k ulozeni do bitmapy
  changedPixels: Array<{x: number, y: number}>;

  //omezeni poctu barev pro polygone a polyline
  limitColors: boolean;
  colors: Array<string>;
  colorOptions: FormControl;

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
    this.colorOptions = new FormControl();
    this.changedPixels = new Array();

    this.itemType = "";
    this.typeID = "";
    this.subTypeID = "";

    this.limitColors = false;
    this.colors = new Array();

   }

  ngOnInit(): void {
    
    this.sub = this.Activatedroute.paramMap.subscribe(params => { 
      this.itemType = params.get('id') || "";
      this.typeID = params.get('id1') || "";
      this.subTypeID = params.get('id2') || "";

      if(this.itemType && this.typeID && this.subTypeID) {
        switch(this.itemType) {
          case 'polyline':
            this.drawableItem = this.fileService.getPolyline(~~this.typeID, ~~this.subTypeID);
            this.limitColors = true;
            break;
          case 'polygone':
            this.drawableItem = this.fileService.getPolygone(~~this.typeID, ~~this.subTypeID);
            this.limitColors = true;
           
            break;
          case 'poi':
            this.drawableItem = this.fileService.getPOI(~~this.typeID, ~~this.subTypeID);
            break;
          default:
            new Error("No item type supplied!");
        }
        this.itemBitmap = this.drawableItem.asBitmap(true);
        if(this.limitColors) {
          if(this.drawableItem.bitmapDay?.colorTable){
            const tempCol = this.drawableItem.bitmapDay?.colorTable;
            for(let i = 0; i < tempCol.length; i++) {
              this.colors.push(tempCol[i].toHex());
            }
            this.color = this.colors[0];
          }
          else {
            const tempCol = this.drawableItem.colDayColor;
            for(let i = 0; i < tempCol.length; i++) {
              this.colors.push(tempCol[i].toHex());
            }
            this.color = this.colors[0];
          }
        }
      }
   });
  }

  ngAfterViewInit(): void {
    this.context = this.myCanvas.nativeElement.getContext('2d');
    this.drawBitmapWithGrid();
    this.storeBitmap();
  }

  setColor(){
    if (!this.context) {
      return;
    }
    this.context.fillStyle = this.color;
    if(this.limitColors) {
      if(this.colorOptions.value) {
        this.itemBitmap.replaceColor(new Color(this.color), new Color(this.colors[this.colorOptions.value]));
        this.updateBitmap();
        this.colors[this.colorOptions.value] = this.color;
        //update color table
        if(this.drawableItem.bitmapDay) {
          let tmpColor: Color = new Color(this.color);
          tmpColor.a = 255;
          this.drawableItem.bitmapDay.colorTable[this.colorOptions.value] = tmpColor;
        }
      }
      else {
        this.itemBitmap.replaceColor(new Color(this.color), new Color(this.colors[0]));
        this.updateBitmap();
        this.colors[0] = this.color;
      }
    }
  }

  stopToolUse(): void {
    if(this.mouseSub) {
      this.mouseSub.unsubscribe();
      this.lineStart = false;
    }
    if(this.mouseUpSub) {
      this.mouseUpSub.unsubscribe();
    }
  }

  useBrush(): void {
    this.stopToolUse();
    const canvasEl: HTMLCanvasElement = this.myCanvas?.nativeElement;
    this.captureMouseMoveEventOnClick(canvasEl, 'brush');
    this.captureEventOnBtnRelease(canvasEl);
  }

  useLine(): void {
    this.stopToolUse();
    const canvasEl: HTMLCanvasElement = this.myCanvas?.nativeElement;
    this.captureMouseMoveEventOnClick(canvasEl, 'line');
    this.captureEventOnBtnRelease(canvasEl);
  }

  useFill(): void {
    this.stopToolUse();
    const canvasEl: HTMLCanvasElement = this.myCanvas?.nativeElement;
    this.captureEventOnClick(canvasEl, 'fill');
  }

  useFilledRectangle(): void {
    this.stopToolUse();
    const canvasEl: HTMLCanvasElement = this.myCanvas?.nativeElement;
    this.captureMouseMoveEventOnClick(canvasEl, 'filled_rectangle');
    this.captureEventOnBtnRelease(canvasEl);
  }

  useRectangle(): void {
    this.stopToolUse();
    const canvasEl: HTMLCanvasElement = this.myCanvas?.nativeElement;
    this.captureMouseMoveEventOnClick(canvasEl, 'rectangle');
    this.captureEventOnBtnRelease(canvasEl);
  }

  useFilledCircle(): void {
    this.stopToolUse();
    const canvasEl: HTMLCanvasElement = this.myCanvas?.nativeElement;
    this.captureMouseMoveEventOnClick(canvasEl, 'filled_circle');
    this.captureEventOnBtnRelease(canvasEl);
  }

  useCircle(): void {
    this.stopToolUse();
    const canvasEl: HTMLCanvasElement = this.myCanvas?.nativeElement;
    this.captureMouseMoveEventOnClick(canvasEl, 'circle');
    this.captureEventOnBtnRelease(canvasEl);
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

  getColor(): void {
    this.stopToolUse();
    const canvasEl: HTMLCanvasElement = this.myCanvas?.nativeElement;
    this.captureEventOnClick(canvasEl, 'dropper');
  }

  erase(): void {
    this.stopToolUse();
    const canvasEl: HTMLCanvasElement = this.myCanvas?.nativeElement;
    this.color = 'ffffff00';
    this.captureMouseMoveEventOnClick(canvasEl, 'brush');
    this.captureEventOnBtnRelease(canvasEl);
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

  private captureEventOnClick(canvasEl: HTMLCanvasElement, tool: String) {
    this.mouseSub = fromEvent(canvasEl, 'mousedown').subscribe((res) => {
      const rect = canvasEl.getBoundingClientRect();
      const currMouseEvent = res as MouseEvent;

      const currentPos = {
        x: currMouseEvent.clientX - rect.left,
        y: currMouseEvent.clientY - rect.top
      };
      switch(tool) {
        case 'fill':
          this.fillColor(currentPos);
          break;
        case 'dropper':
          this.getSelectedColor(currentPos);
          break;
      }
    });
  }

  private captureEventOnBtnRelease(canvasEl: HTMLCanvasElement) {
    this.mouseUpSub = fromEvent(canvasEl, 'mouseup').subscribe((res) => {
      
      this.storeChanges();
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

  storeChanges(): void {
    let newPixelColor: Color = new Color(this.color);
    for(let i = 0; i < this.changedPixels.length; i++) {
      let convertedCoordinates = this.convertCoordinates(this.changedPixels[i]);
      this.itemBitmap.setPixel(convertedCoordinates.x, convertedCoordinates.y, newPixelColor);
    }
    this.storeBitmap();
    this.changedPixels.splice(0, this.changedPixels.length);
    this.updateBitmap();
    this.lineStart = false;
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
    this.changedPixels.push({x: x  , y: y  });
  }

  private drawColorCell2(x: number, y: number): void {
    if (!this.context) {
      return;
    }
    this.context.fillStyle = this.color;
    this.context.fillRect(x, y, this.scaleNum, this.scaleNum);
    this.changedPixels.push({x: x +1, y: y +1});
  }

  private drawLine(prevPos: { x: number; y: number }, currentPos: { x: number; y: number }): void {
    if (!this.context) {
      return;
    }
    this.changedPixels.splice(0, this.changedPixels.length);
    this.updateBitmap();
    this.interpolateLine(prevPos, currentPos);
  }

  private fillColor(currentPos: { x: number; y: number }): void {
    if(this.itemBitmap && this.context) {
      let convertedCoordinates = this.convertCoordinates(currentPos);
      this.itemBitmap.fill(convertedCoordinates.x, convertedCoordinates.y, new Color(this.color));
      this.storeBitmap();
      this.updateBitmap();
    }
  }

  private drawRectangle(prevPos: { x: number; y: number }, currentPos: { x: number; y: number }): void {
    if (!this.context) {
      return;
    }
    this.changedPixels.splice(0, this.changedPixels.length);
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
    this.changedPixels.splice(0, this.changedPixels.length);
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

    this.changedPixels.splice(0, this.changedPixels.length);
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

    this.changedPixels.splice(0, this.changedPixels.length);
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
    this.storeBitmap();
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
    this.storeBitmap();
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
    this.storeBitmap();
    this.updateBitmap();
  }

  getSelectedColor(currentPos: { x: number; y: number }): void {
    if(this.itemBitmap && this.context) {
      let convertedCoordinates = this.convertCoordinates(currentPos);
      this.color = this.itemBitmap.getPixelColor(convertedCoordinates.x, convertedCoordinates.y).toHex();
    }
  }

  findNearestColor(pallet: string): void {
    if(this.itemBitmap) {
      switch(pallet) {
        case 'Garmin256':
            this.itemBitmap.applyColorPallet('Garmin256');
            break;
        case 'Garmin64':
            this.itemBitmap.applyColorPallet('Garmin64');
            break;
        case 'Garmin16':
            this.itemBitmap.applyColorPallet('Garmin16');
            break;
        default:
          this.itemBitmap.applyColorPallet('Garmin256');
      }
      this.storeBitmap();
      this.updateBitmap();
    }
  }

  inverseColors(): void {
    if(this.itemBitmap) { 
      if(this.limitColors && this.drawableItem.bitmapDay) {
        this.colors.splice(0, this.colors.length);
        for(let i = 0; i < this.drawableItem.bitmapDay.colorTable.length; i++){ 
          this.drawableItem.bitmapDay.colorTable[i] = this.itemBitmap.getInverseColor(this.drawableItem.bitmapDay.colorTable[i]);
          this.colors.push(this.drawableItem.bitmapDay.colorTable[i].toHex());
        } 
      }
      this.itemBitmap.inverseColors();
      this.storeBitmap();
      this.updateBitmap();
    }
  }

  private storeBitmap(): void {
    let clone = new Bitmap(this.itemBitmap.width, this.itemBitmap.height);
    clone.copyData(this.itemBitmap.pixelArr);
    this.undoQuery.push(clone);
  }

  undo(): void {
    let tmp = this.undoQuery.pop();
    if(tmp) {
      this.redoQuery.push(tmp);
    }
    if(this.undoQuery.length > 0) { 
      this.itemBitmap = new Bitmap(this.itemBitmap.width, this.itemBitmap.height);
      this.itemBitmap.copyData(this.undoQuery[this.undoQuery.length -1].pixelArr);
      //this.itemBitmap = this.undoQuery[this.undoQuery.length -1];
    }
    
    this.updateBitmap();
  }

  redo(): void {
    if(this.redoQuery.length > 0) {
      this.itemBitmap = new Bitmap(this.itemBitmap.width, this.itemBitmap.height);
      this.itemBitmap.copyData(this.redoQuery[this.redoQuery.length -1].pixelArr);
      //this.itemBitmap = this.redoQuery[this.redoQuery.length -1];
    }
    
    let tmp = this.redoQuery.pop();
    if(tmp) {
      this.undoQuery.push(tmp);
    }
    this.updateBitmap();
  }

  saveChangesToFile(): void {
    if(this.itemBitmap) {
      this.fileService.updateFileItem(this.itemType, ~~this.typeID, ~~this.subTypeID, this.drawableItem, this.itemBitmap);
    }
  }

  updateColorPicker(colorVal: string): void {
    this.color = colorVal;
  }
}
