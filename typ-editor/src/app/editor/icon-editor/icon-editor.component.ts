import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GraphicElement } from 'src/TYP_File_lib/TypFile_blocks/GeneralDataBlocks/GraphicElement';
import { FileService } from 'src/app/services/file.service';
import { fromEvent, Subject, Subscription } from 'rxjs';
import { switchMap, takeUntil, pairwise } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { Bitmap } from 'src/TYP_File_lib/Utils/Bitmap';
import { Color } from 'src/TYP_File_lib/Utils/Color';
import { saveAs } from "file-saver";
import { MatMenuTrigger } from '@angular/material/menu';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ResizeComponent } from './resize/resize.component';
import { ResizePolylineComponent } from './resize-polyline/resize-polyline.component';
import { SelectTextureComponent } from './select-texture/select-texture.component';
import { Effects } from 'src/app/bitmap-canvas/effects';
import { SelectColorFilterComponent } from './select-color-filter/select-color-filter.component';


@Component({
  selector: 'app-icon-editor',
  templateUrl: './icon-editor.component.html',
  styleUrls: ['./icon-editor.component.css']
})
export class IconEditorComponent implements OnInit, AfterViewInit {

  @Input() iconType: string;

  @Input() notifier!: Subject<boolean>;

  @Output() unsavedChangesEvent = new EventEmitter<boolean>();

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

  @ViewChild('canvasMapPreview', {static: false}) 
  mapPreviewCanvas!: ElementRef<HTMLCanvasElement>;
  mapPreviewCanvasContext!: CanvasRenderingContext2D | null;

  @ViewChild(MatMenuTrigger, {static: true}) matMenuTrigger!: MatMenuTrigger; 
  menuTopLeftPosition =  {x: '0', y: '0'} 

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

  //nove startovni souradnice po posunu ikonky
  newIconPosition: {x: number, y: number};

  //omezeni poctu barev pro polygone a polyline
  limitColors: boolean;
  colors: Array<string>;
  selectedColorIndex: number;

  dayOrNightMode: boolean;
  //ma nocni ikonku?
  hasNightIcon: boolean;

  //omezeni editacnich nastroju pro nocni ikonku Polyline / Polygone
  limitToolUse: boolean;

  darkMode: boolean;

  hideTools: boolean;

  // Obsahuje barvy mimo Garmin paletu?
  garminCols =  {garmin16: false, garmin64: false, garmin256: false, warning: false};

  textCanvas: HTMLCanvasElement = document.createElement('canvas');
  textCanvasCtx: CanvasRenderingContext2D | null = this.textCanvas.getContext("2d");
  inputText: string = '';
  inputTextSize: number  = 10;
  panelOpenState: boolean = false;
  textToolActive: boolean = false;
  textCoordinates: {x: number, y: number} = {x: 20, y: 200};
  
  constructor(private fileService: FileService, private Activatedroute: ActivatedRoute, private matDialog: MatDialog) {
    this.iconType = "Day";
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
    this.changedPixels = new Array();
    this.newIconPosition = {x: 0, y: 0};
    this.selectedColorIndex = 0;

    this.itemType = "";
    this.typeID = "";
    this.subTypeID = "";

    this.limitColors = false;
    this.colors = new Array();

    this.dayOrNightMode = false;
    this.hasNightIcon = false;

    this.limitToolUse = false;

    this.darkMode = false;

    this.hideTools = false;

   }

  ngOnInit(): void {
    this.notifier.subscribe(() =>{this.saveChangesToFile()});
    
    this.sub = this.Activatedroute.paramMap.subscribe(params => { 
      this.itemType = params.get('id') || "";
      this.typeID = params.get('id1') || "";
      this.subTypeID = params.get('id2') || "";

      if(this.itemType && this.typeID && this.subTypeID) {
        switch(this.itemType) {
          case 'polyline':
            this.drawableItem = this.fileService.getPolyline(~~this.typeID, ~~this.subTypeID);
            this.limitColors = true;
            if(this.iconType == 'Night' || !this.drawableItem.bitmapDay) {
              this.limitToolUse = true;
            }
            break;
          case 'polygone':
            this.drawableItem = this.fileService.getPolygone(~~this.typeID, ~~this.subTypeID);
            this.limitColors = true;
            if(this.iconType == 'Night') {
              this.limitToolUse = true;
            }
            break;
          case 'poi':
            this.drawableItem = this.fileService.getPOI(~~this.typeID, ~~this.subTypeID);
            break;
          default:
            new Error("No item type supplied!");
        }
        switch(this.iconType) {
          case 'Day':
            this.dayOrNightMode = true;
            this.itemBitmap = this.drawableItem.asBitmap(true);
            break;
          case 'Night':
            this.dayOrNightMode = false;
            this.itemBitmap = this.drawableItem.asBitmap(false);
            break;
        }
        if(this.drawableItem.colNightColor.length != 0 || this.drawableItem.bitmapNight) {
          switch(this.itemType) {
            case 'polyline':
              this.hasNightIcon = true;
              break;
            case 'polygone':
              if(this.fileService.getPolygone(~~this.typeID, ~~this.subTypeID).hasNightIcon()) {
                this.hasNightIcon = true;
              }
              break;
            case 'poi':
              this.hasNightIcon = true;
              break;
          }
        }
        if(!this.dayOrNightMode && !this.hasNightIcon) {
          this.hideTools = true;
        }
        // if(this.limitColors) {
          this.itemBitmap.getAllColors().forEach((col, index) => {
            this.colors.push(col.toHex());
          });
          if(this.colors.length == 1) {
            this.colors.push('#FFFFFF');
          }
          this.color = this.colors[0];
        // }
      }
   });

   this.checkForNonGarminColors();
  }

  ngAfterViewInit(): void {
    this.context = this.myCanvas.nativeElement.getContext('2d');
    // this.textCanvas = document.createElement('canvas');
    // this.textCanvasCtx = this.textCanvas.getContext("2d");
    this.drawBitmapWithGrid();
    this.storeBitmap();
    this.mapPreviewCanvasContext = this.mapPreviewCanvas.nativeElement.getContext('2d');
    if(this.itemType == 'polygone' || this.itemType == 'polyline') {
      this.drawMapPreview();
    }
  }

  setStateOfChanges(changes: boolean): void {
    this.unsavedChangesEvent.emit(changes);
  }

  setColor(): void{
    if (!this.context) {
      return;
    }
    this.context.fillStyle = this.color;
    if(this.limitColors) {
      this.itemBitmap.replaceColor(new Color(this.color), new Color(this.colors[this.selectedColorIndex]));
      this.updateBitmap();
      if(this.itemType == 'polygone' || this.itemType == 'polyline') {
        this.drawMapPreview();
      }
      this.colors[this.selectedColorIndex] = this.color;

      this.setStateOfChanges(true);
    }
    if(this.textToolActive) {
      this.insertTextToCanvas();
    }
    this.storeBitmap();
  }

  stopToolUse(): void {
    if(this.mouseSub) {
      this.mouseSub.unsubscribe();
      this.lineStart = false;
    }
    if(this.mouseUpSub) {
      this.mouseUpSub.unsubscribe();
    }
    this.textToolActive = false;
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

  dragIcon(): void {
    this.stopToolUse();
    const canvasEl: HTMLCanvasElement = this.myCanvas?.nativeElement;
    this.captureMouseMoveEventOnClick(canvasEl, 'drag');
    this.captureEventOnBtnReleaseForDrag(canvasEl);
  }

  insertText(): void {
    if(!this.textToolActive) {
      this.stopToolUse();
      this.textToolActive = true;
      this.panelOpenState = true;
      const canvasEl: HTMLCanvasElement = this.myCanvas?.nativeElement;
      this.captureMouseMoveEventOnClick(canvasEl, 'textDrag');
    }
    else {
      this.stopToolUse();
      this.updateBitmap();
      this.panelOpenState = false;
    }
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
          case 'drag':
            this.dragIconToPosition({x: this.lineStartX, y: this.lineStartY}, currentPos);
            break;
          case 'textDrag':
            this.insertTextToCanvas(currentPos);
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

  private captureEventOnBtnReleaseForDrag(canvasEl: HTMLCanvasElement) {
    this.mouseUpSub = fromEvent(canvasEl, 'mouseup').subscribe((res) => {
      
      this.moveIconPixels();
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
    this.updateColorLimit();
    if(this.itemType == 'polygone' || this.itemType == 'polyline') {
      this.drawMapPreview();
    }
    this.lineStart = false;
    this.setStateOfChanges(true);
  }

  moveIconPixels(): void {
    this.itemBitmap.movePixels(this.newIconPosition);
    this.storeBitmap();
    this.updateBitmap();
    if(this.itemType == 'polygone' || this.itemType == 'polyline') {
      this.drawMapPreview();
    }
    this.lineStart = false;
    this.setStateOfChanges(true)
  }

  updateBitmap(): void{
    if (!this.context) {
      return;
    }
    this.drawBitmapWithGrid();
    // if(this.itemType == 'polygone') {
    //   this.drawMapPreview();
    // }
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

  drawMapPreview(): void {
    let repeatNum: number = 0;
    switch(this.itemType) {
      case 'polygone':
        repeatNum = 6;
        if(this.itemBitmap && this.mapPreviewCanvasContext) {
          if(this.context) {
            this.mapPreviewCanvasContext.canvas.width = this.itemBitmap.width *repeatNum;
            this.mapPreviewCanvasContext.canvas.height = this.itemBitmap.height *repeatNum;
            for(let i = 0; i < repeatNum; i++) {
              for(let j = 0; j < repeatNum; j++) { 
                for(let y = 0; y < this.itemBitmap.height; y++) {
                  for(let x = 0; x < this.itemBitmap.width; x++) {
                    this.mapPreviewCanvasContext.beginPath();
                    this.mapPreviewCanvasContext.fillStyle =  this.itemBitmap.getPixelColor(x, y).toRgba();
                    this.mapPreviewCanvasContext.fillRect(x + i * this.itemBitmap.width, y + j * this.itemBitmap.height, 1, 1);
                    this.mapPreviewCanvasContext.stroke();
                  }
                }
              }
            }
          }
        }
        break;
      case 'polyline':
        repeatNum = 2;
        const scaleNum = 3;
        if(this.itemBitmap && this.mapPreviewCanvasContext) {
          if(this.context) {
            this.mapPreviewCanvasContext.canvas.width = this.itemBitmap.width *repeatNum *scaleNum;
            this.mapPreviewCanvasContext.canvas.height = this.itemBitmap.height *scaleNum;
            for(let i = 0; i < repeatNum; i++) {
              for(let y = 0; y < this.itemBitmap.height; y++) {
                for(let x = 0; x < this.itemBitmap.width; x++) {
                  this.mapPreviewCanvasContext.beginPath();
                  this.mapPreviewCanvasContext.fillStyle =  this.itemBitmap.getPixelColor(x, y).toRgba();
                  this.mapPreviewCanvasContext.fillRect(x  *scaleNum + (this.itemBitmap.width * scaleNum * i), y *scaleNum, scaleNum, scaleNum);
                  this.mapPreviewCanvasContext.stroke();
                }
              }
            }
          }
        }
        break;
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
      if(this.itemType == 'polygone' || this.itemType == 'polyline') {
        this.drawMapPreview();
      }
      this.setStateOfChanges(true);
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
  
  dragIconToPosition(prevPos: { x: number; y: number }, currentPos: { x: number; y: number }): void {
    if(this.itemBitmap && this.context) {
      let curCoordinates = this.convertCoordinates(currentPos);
      let prevCoordinates = this.convertCoordinates(prevPos);
      // const offsetX: number = curCoordinates.x -prevCoordinates.x;
      // const offsetY: number = curCoordinates.y - prevCoordinates.y;
      this.newIconPosition.x = curCoordinates.x -prevCoordinates.x;
      this.newIconPosition.y = curCoordinates.y -prevCoordinates.y;
      this.context.clearRect(0, 0, this.myCanvas.nativeElement.width, this.myCanvas.nativeElement.height);
      for(let y = 0; y < this.itemBitmap.height; y++) {
        for(let x = 0; x < this.itemBitmap.width; x++) {
          this.context.beginPath();
          this.context.fillStyle =  this.itemBitmap.getPixelColor(x, y).toRgba();
          this.context.fillRect((x+ this.newIconPosition.x) *this.scaleNum, (y+ this.newIconPosition.y) *this.scaleNum, this.scaleNum, this.scaleNum);
          this.context.stroke();
        }
      }
      this.drawGrid(this.itemBitmap.width *this.scaleNum, this.itemBitmap.height*this.scaleNum);
      
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
    if(this.itemType == 'polygone' || this.itemType == 'polyline') {
      this.drawMapPreview();
    }
    this.setStateOfChanges(true);
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
    if(this.itemType == 'polygone' || this.itemType == 'polyline') {
      this.drawMapPreview();
    }
    this.setStateOfChanges(true);
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
    if(this.itemType == 'polygone' || this.itemType == 'polyline') {
      this.drawMapPreview();
    }
    this.setStateOfChanges(true);
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
      this.colors.splice(0, this.colors.length);
      if(this.limitColors) {
        this.itemBitmap.getAllColors().forEach((col, index) => {
          this.colors.push(col.toHex());
        });
      }
      this.storeBitmap();
      this.updateBitmap();
      if(this.itemType == 'polygone' || this.itemType == 'polyline') {
        this.drawMapPreview();
      }
      this.setStateOfChanges(true);
    }
  }

  inverseColors(): void {
    if(this.itemBitmap) { 
      this.itemBitmap.inverseColors();
      if(this.limitColors) { 
        this.colors.splice(0, this.colors.length);
        this.itemBitmap.getAllColors().forEach((col, index) => {
          this.colors.push(col.toHex());
        });
      }
      this.storeBitmap();
      this.updateBitmap();
      if(this.itemType == 'polygone' || this.itemType == 'polyline') {
        this.drawMapPreview();
      }
      this.setStateOfChanges(true);
    }
  }

  private storeBitmap(): void {
    let clone = new Bitmap(this.itemBitmap.width, this.itemBitmap.height);
    clone.copyData(this.itemBitmap.pixelArr);
    this.undoQuery.push(clone);
    this.checkForNonGarminColors();
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
    if(this.itemType == 'polygone' || this.itemType == 'polyline') {
      this.drawMapPreview();
    }
    this.setStateOfChanges(true);
    this.updateColorLimit();
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
    if(this.itemType == 'polygone' || this.itemType == 'polyline') {
      this.drawMapPreview();
    }
    this.setStateOfChanges(true);
    this.updateColorLimit();
  }

  saveChangesToFile(): void {
    if(this.itemBitmap) {
      switch(this.iconType) {
        case 'Day':
          this.fileService.updateFileItem(this.itemType, ~~this.typeID, ~~this.subTypeID, this.drawableItem, this.itemBitmap, this.dayOrNightMode);
          break;
        case 'Night':
          if(this.hasNightIcon) {
            this.fileService.updateFileItem(this.itemType, ~~this.typeID, ~~this.subTypeID, this.drawableItem, this.itemBitmap, this.dayOrNightMode);
          }
          break;
      }

      this.setStateOfChanges(false);
    }
  }

  updateColorPicker(colorVal: string, index: number): void {
    this.color = colorVal;
    this.selectedColorIndex = index;
  }

  drawUnscaledImage(): void {
    if(this.itemBitmap && this.context) {
      if(this.context) {
        this.context.canvas.width = this.itemBitmap.width;
        this.context.canvas.height = this.itemBitmap.height;

        for(let y = 0; y < this.itemBitmap.height; y++) {
          for(let x = 0; x < this.itemBitmap.width; x++) {
            this.context.beginPath();
            this.context.fillStyle =  this.itemBitmap.getPixelColor(x, y).toRgba();
            this.context.fillRect(x, y, 1, 1);
            this.context.stroke();
          }
        }
      }
    }
  }

  downloadCanvas(): void {
    this.drawUnscaledImage();
    let data = this.myCanvas.nativeElement.toBlob(function(blob){
      if(blob != null) {
        saveAs(blob, "image.png");
      }
    }, 'image/png', 1);
    this.updateBitmap();
  }

  handleFileInput(event: any): void {
    let file: File = event.target.files[0];
    let img = new Image();

    if (file) {
      img.onload = () => {
        this.context?.clearRect(0, 0, this.myCanvas.nativeElement.width, this.myCanvas.nativeElement.height);
        this.context?.drawImage(img, 0, 0);
        const imgData = this.context?.getImageData(0, 0, img.width, img.height).data;
    
        if(imgData) {
          this.itemBitmap.pixelArr = imgData;
          this.drawBitmapWithGrid();
          if(this.itemType == 'polygone' || this.itemType == 'polyline') {
            this.drawMapPreview();
          }
          if(this.limitColors) {
            this.colors.splice(0, this.colors.length);
            this.itemBitmap.getAllColors().forEach((col, index) => {
              this.colors.push(col.toHex());
            });
          }
          this.setStateOfChanges(true);
        }
      }

      var reader = new FileReader();

      reader.onload = () => {
        img.src = reader.result as string;
        
      };

      reader.readAsDataURL(file)

      reader.onerror = () => {
        console.log(reader.error);
      };
    }
  }

  addNightIconInverse(): void {
    this.hasNightIcon = true;
    this.hideTools = false;
    this.itemBitmap.inverseColors();
    this.updateBitmap();
    this.drawMapPreview();
    if(this.limitColors) {
      this.colors.splice(0, this.colors.length);
      this.itemBitmap.getAllColors().forEach((col, index) => {
        this.colors.push(col.toHex());
      });
      if(this.colors.length == 1) {
        this.colors.push('#FFFFFF');
      }
      this.color = this.colors[0];
    }
    this.setStateOfChanges(true);
  }

  addNightIconSameAsDay(): void {
    this.hasNightIcon = true;
    this.hideTools = false;
    this.updateBitmap();
    this.drawMapPreview();
    if(this.limitColors) {
      this.colors.splice(0, this.colors.length);
      this.itemBitmap.getAllColors().forEach((col, index) => {
        this.colors.push(col.toHex());
      });
      if(this.colors.length == 1) {
        this.colors.push('#FFFFFF');
      }
      this.color = this.colors[0];
    }
    this.setStateOfChanges(true);
  }

  addEmptyNightIcon(): void {
    this.hasNightIcon = true;
    this.hideTools = false;
    this.itemBitmap.clearBitmap();
    this.updateBitmap();
    this.setStateOfChanges(true);
  }

  changeMode(): void {
    this.darkMode = !this.darkMode;
  }

  onRightClick(event: MouseEvent): void {
    event.preventDefault(); 
    this.menuTopLeftPosition.x = event.clientX + 'px'; 
    this.menuTopLeftPosition.y = event.clientY + 'px'; 
    this.matMenuTrigger.openMenu();
  }

  clearCanvas(): void {
    this.itemBitmap.clearBitmap();
    this.updateBitmap();
    this.drawMapPreview();
    this.setStateOfChanges(true);
    this.updateColorLimit();
    this.storeBitmap();
  }

  importNightIcon(): void {
    this.itemBitmap = this.drawableItem.asBitmap(false);
    this.updateBitmap();
    this.drawMapPreview();
    this.updateColorLimit();
    this.storeBitmap();
  }

  importDayIcon(): void {
    this.itemBitmap = this.drawableItem.asBitmap(true);
    this.updateBitmap();
    this.drawMapPreview();
    this.updateColorLimit();
    this.storeBitmap();
  }

  updateColorLimit(): void {
    //if(this.limitColors) {
      this.colors.splice(0, this.colors.length);
      this.itemBitmap.getAllColors().forEach((col, index) => {
        this.colors.push(col.toHex());
      });

      // this.itemBitmap.getAllColors().forEach((col, index) => {
      //   if(!(this.colors.some(e => e == col.toHex()))) {
      //     this.colors.push(col.toHex());
      //   }
      // });
      
      if(this.colors.length == 1) {
        this.colors.push('#FFFFFF');
      }
      //this.color = this.colors[0];
    //}
  }

  checkForNonGarminColors(): void {
    const itemCols: Array<Color> = this.itemBitmap.getAllColors();

    this.garminCols.garmin16 = this.itemBitmap.checkForNonGarminColors_palette16(itemCols);
    this.garminCols.garmin64 = this.itemBitmap.checkForNonGarminColors_palette64(itemCols);
    this.garminCols.garmin256 = this.itemBitmap.checkForNonGarminColors_palette256(itemCols);
    if (this.garminCols.garmin16 || this.garminCols.garmin64 || this.garminCols.garmin256) {
      this.garminCols.warning = true;
    }
    else {
      this.garminCols.warning = false;
    }
  }

  highlightColorTile(colIndex: number): boolean {
    if(this.selectedColorIndex == colIndex) {
      return true;
    }
    return false;
  }

  resizeIcon(): void {
    switch(this.itemType) {
      case 'poi':
        this.resizePOIIcon();
        break;
      case 'polyline':
        this.resizePolylineIcon();
        break;
    }
  }

  resizePOIIcon(): void {
    const dialogRef = this.matDialog.open( ResizeComponent, {
      data: {
        icon: this.itemBitmap,
      },
      minWidth: '40vw',
    });
    dialogRef.afterClosed().subscribe(result => {
      if(result) {
        if(result.rescaled) {
          this.scaleIcon(result);
        }
        if(result.resized) {
          this.scaleCanvas(result);
        }
      }
    });
  }

  scaleIcon(size: {newWidth: number, newHeight: number}): void {
    this.itemBitmap = this.itemBitmap.scale(size);
    this.storeBitmap();
    this.updateBitmap();
  }

  scaleCanvas(size: {newWidth: number, newHeight: number, newCanvasWidth: number, newCanvasHeight: number}): void {
    
    if(this.context) {
      this.itemBitmap = this.itemBitmap.resize({newWidth: Math.round(size.newCanvasWidth / 20), newHeight: Math.round(size.newCanvasHeight / 20)});
      this.storeBitmap();
      this.updateBitmap();
    }
  }

  resizePolylineIcon(): void {
    const dialogRef = this.matDialog.open( ResizePolylineComponent, {
      data: {
        icon: this.itemBitmap,
        polyline: this.fileService.getPolyline(~~this.typeID, ~~this.subTypeID),
      },
      minWidth: '40vw',
    });
    dialogRef.afterClosed().subscribe(result => {
      if(result) {
        // this.scaleIcon(result);
        // if(!result.withBitmap) {
        //   console.log('no bitmap');
        //   const tempPolyline = this.fileService.getPolyline(~~this.typeID, ~~this.subTypeID);
        //   tempPolyline.changeBorderAndLine(result.borderWidth, result.lineWidth);
        //   this.itemBitmap = tempPolyline.asBitmap(this.dayOrNightMode);
        //   this.storeBitmap();
        //   this.updateBitmap();
        // }
        if(result.withBitmap) {
          this.scaleIcon(result);
        }
        else {
          if(result.convertToBitmap) {
            
            //const tempPolyline = this.fileService.getPolyline(~~this.typeID, ~~this.subTypeID);
            //this.itemBitmap = tempPolyline.asBitmap(this.dayOrNightMode);
            switch(this.iconType) {
              case 'Day':
                this.fileService.updatePolylineDay(this.itemType, ~~this.typeID, ~~this.subTypeID, this.drawableItem, this.itemBitmap, true);
                break;
              case 'Night':
                this.fileService.updatePolylineNight(this.itemType, ~~this.typeID, ~~this.subTypeID, this.drawableItem, this.itemBitmap, true);
                break;
            }
           
            this.itemBitmap = this.fileService.getPolyline(~~this.typeID, ~~this.subTypeID).asBitmap(this.dayOrNightMode);
            this.limitToolUse = false;
            this.scaleIcon(result);
          }
          else {
            const tempPolyline = this.fileService.getPolyline(~~this.typeID, ~~this.subTypeID);
            tempPolyline.changeBorderAndLine(result.borderWidth, result.lineWidth);
            this.itemBitmap = tempPolyline.asBitmap(this.dayOrNightMode);
          }
        }
        this.storeBitmap();
        this.updateBitmap()
      }
    });
  }

  insertTextToCanvas(currentPos: { x: number; y: number } = {x: this.textCoordinates.x, y: this.textCoordinates.y}): void {
    this.panelOpenState = true;
    this.textCoordinates = currentPos;
    const textCoordinates = this.convertCoordinates(currentPos);
    if(this.textCanvasCtx && this.context) {
      this.textCanvasCtx.clearRect(0, 0, this.textCanvas.width, this.textCanvas.height);
      this.updateBitmap();
      this.textCanvasCtx.fillStyle = this.color;
      if(this.inputTextSize >= 10) {
        this.textCanvasCtx.font = this.inputTextSize + "px Arial";
      }
      else {
        this.textCanvasCtx.font = "10px Arial";
      }
      
      if(this.inputText != '') {
        this.textCanvasCtx.fillText(this.inputText, textCoordinates.x, textCoordinates.y);
      }
      else {
        this.textCanvasCtx.fillText("T E X T", textCoordinates.x, textCoordinates.y);
      }
      

      const unscaledBitmap = this.textCanvasCtx.getImageData(0, 0, this.textCanvas.width, this.textCanvas.height).data;
      const upscaleValue: number = 20;
      for (let x = 0; x < this.textCanvas.width; x++){
        for (let y = 0; y < this.textCanvas.height; y++){
           const i = (y * this.textCanvas.width + x) *4;
          //  const r = unscaledBitmap[i];
          //  const g = unscaledBitmap[i+1];
          //  const b = unscaledBitmap[i+2];
           const a = unscaledBitmap[i+3];
           if(a != 0) {
            this.context.fillStyle = this.color; //"rgba("+r+","+g+","+b+","+(255)+")"
            this.context.fillRect(x*upscaleValue,y*upscaleValue,upscaleValue,upscaleValue);
          }
        }
      }
    }
  }

  toggleTextPanel(): void {
    // this.panelOpenState = !this.panelOpenState;
    this.panelOpenState = true;
    this.insertText();
    //this.textToolActive = this.panelOpenState;
  }

  applyTextToBitmap(): void {
    if(this.textCanvasCtx && this.itemBitmap) {
      const unscaledBitmap = this.textCanvasCtx.getImageData(0, 0, this.textCanvas.width, this.textCanvas.height).data;
      for (let x = 0; x < this.textCanvas.width; x++){
        for (let y = 0; y < this.textCanvas.height; y++){
            const i = (y * this.textCanvas.width + x) *4;
            // const r = unscaledBitmap[i];
            // const g = unscaledBitmap[i+1];
            // const b = unscaledBitmap[i+2];
            const a = unscaledBitmap[i+3];
            if(a != 0 && x <= this.itemBitmap.width && y <= this.itemBitmap.height) {
              this.itemBitmap.setPixel(x, y, new Color(this.color));
          }
        }
      }
      this.stopToolUse();
      this.storeBitmap();
      this.updateBitmap();
      if(this.itemType == 'polygone' || this.itemType == 'polyline') {
        this.drawMapPreview();
      }
      this.setStateOfChanges(true);
      this.stopToolUse();
      this.panelOpenState = false;
    }
  }

  selectTexture(): void {
    const dialogRef = this.matDialog.open( SelectTextureComponent, {
      data: {
        icon: this.drawableItem,
        patternColor: this.color
      },
     /* minWidth: '40vw',*/
    });
    dialogRef.afterClosed().subscribe(result => {
      if(result != undefined) {
        switch(result) {
          case Effects.ChessBoard:
            this.itemBitmap.drawChessBoard(new Color(this.color));
            break;
          case Effects.Horizontal:
            this.itemBitmap.drawHorizontalLines(new Color(this.color));
            break;
          case Effects.Vertical:
            this.itemBitmap.drawVerticalLines(new Color(this.color));
            break;
          case Effects.DiagonalLeft:
            this.itemBitmap.drawDiagonalLinesLeft(new Color(this.color), 4);
            break;
          case Effects.DiagonalRight:
            this.itemBitmap.drawDiagonalLinesRight(new Color(this.color), 4);
            break;
          case Effects.Diamond:
            this.itemBitmap.drawDiamond(new Color(this.color), 8);
            break;
          default:
            console.log('undefined effect');
        }
        if(this.itemType == 'polygone' || this.itemType == 'polyline') {
          this.drawMapPreview();
        }
        this.updateBitmap();
        this.setStateOfChanges(true);
      }
    });
  }

  selectColorFilter(): void {
    const dialogRef = this.matDialog.open( SelectColorFilterComponent, {
      data: {
        icon: this.drawableItem,
      },
    });
    dialogRef.afterClosed().subscribe(result => {
      if(result != undefined) {
        switch(result) {
          case Effects.GrayScale:
            this.itemBitmap.grayScaleFilter();
            break;
          case Effects.Inverse:
            this.itemBitmap.inverseColors();
            break;
          default:
            console.log('undefined effect');
        }
        if(this.itemType == 'polygone' || this.itemType == 'polyline') {
          this.drawMapPreview();
        }
        this.updateBitmap();
        this.setStateOfChanges(true);
      }
    });
  }
}


