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

  //kolikrat bude lazdy pixel zvetseny
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

  updateBitmap(): void{
    if (!this.context) {
      return;
    }
    //this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
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

  stopToolUse(): void {
    if(this.mouseSub) {
      this.mouseSub.unsubscribe();
      this.lineStart = false;
    }
  }

  useBrush(): void {
    this.stopToolUse();
    const canvasEl: HTMLCanvasElement = this.myCanvas?.nativeElement;
    this.brushToolCaptureEvents(canvasEl);
  }

  useLine(): void {
    this.stopToolUse();
    const canvasEl: HTMLCanvasElement = this.myCanvas?.nativeElement;
    this.lineToolCaptureEvents(canvasEl);
  }

  useFill(): void {
    this.stopToolUse();
    const canvasEl: HTMLCanvasElement = this.myCanvas?.nativeElement;
    this.fillToolCaptureEvents(canvasEl);
  }

  useRectangle(): void {
    this.stopToolUse();
    const canvasEl: HTMLCanvasElement = this.myCanvas?.nativeElement;
    this.rectangleToolCaptureEvents(canvasEl);
  }

  useCircle(): void {
    this.stopToolUse();
    const canvasEl: HTMLCanvasElement = this.myCanvas?.nativeElement;
    this.circleToolCaptureEvents(canvasEl);
  }
  
  private brushToolCaptureEvents(canvasEl: HTMLCanvasElement) {
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

        this.interpolateLine(prevPos, currentPos);
      });
  }

  
  private positionChange(currentPos: { x: number; y: number }): boolean {
    let rw2 = currentPos.x - 1;
    let rh2 = currentPos.y - 1;
    rw2 = rw2 - rw2 % this.scaleNum;
    rh2 = rh2 - rh2 % this.scaleNum;
    //console.log(rw + " " + rh + " " + rw2 + " " + rh2);
    if(rw2 == this.x && rh2 == this.y) {
      return false;
    }
    this.x = rw2;
    this.y = rh2;
    //console.log("change");
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
          //console.log("draw");
          this.drawColorCell(X, Y);
      }
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
    //this.itemBitmap.setPixel(rw / this.scaleNum, rh / this.scaleNum, new Color(255, 0, 0, 255));
    this.context.fillStyle = this.color;
    this.context.fillRect(rw, rh, this.scaleNum, this.scaleNum);
    //this.updateBitmap();
  }

  private drawGrid(width: number, height: number): void {
    if (!this.context) {
      return;
    }
    for(let y = 0; y < height; y++) {
      for(let x = 0; x < width; x++) {
        this.context.beginPath();
        this.context.strokeStyle = "#FF0000";
        this.context.rect(x *this.scaleNum, y *this.scaleNum, this.scaleNum, this.scaleNum);
        this.context.stroke();
      }
    }
  }

  private lineToolCaptureEvents(canvasEl: HTMLCanvasElement) {
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

        if(this.lineStart == false) {
          this.lineStartX =  prevMouseEvent.clientX - rect.left;
          this.lineStartY = prevMouseEvent.clientY - rect.top;
          this.lineStart = true;
        }    
        const currentPos = {
          x: currMouseEvent.clientX - rect.left,
          y: currMouseEvent.clientY - rect.top
        };

        this.drawLine({x: this.lineStartX, y: this.lineStartY}, currentPos);
      });
  }

  private drawLine(prevPos: { x: number; y: number }, currentPos: { x: number; y: number }): void {
    if (!this.context) {
      return;
    }
    this.updateBitmap();
    this.interpolateLine(prevPos, currentPos);
  }

  private fillToolCaptureEvents(canvasEl: HTMLCanvasElement) {
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

  private rectangleToolCaptureEvents(canvasEl: HTMLCanvasElement) {
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

        if(this.lineStart == false) {
          this.lineStartX =  prevMouseEvent.clientX - rect.left;
          this.lineStartY = prevMouseEvent.clientY - rect.top;
          this.lineStart = true;
        }    
        const currentPos = {
          x: currMouseEvent.clientX - rect.left,
          y: currMouseEvent.clientY - rect.top
        };

        this.drawRectangle({x: this.lineStartX, y: this.lineStartY}, currentPos);
      });
  }

  private drawRectangle(prevPos: { x: number; y: number }, currentPos: { x: number; y: number }): void {
    if (!this.context) {
      return;
    }
    //this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
    this.updateBitmap();
    this.interpolateLine(prevPos, { x: currentPos.x, y: prevPos.y });
    this.interpolateLine(prevPos, { x: prevPos.x, y: currentPos.y });
    this.interpolateLine({ x: currentPos.x, y: prevPos.y }, currentPos);
    this.interpolateLine({ x: prevPos.x, y: currentPos.y }, { x: currentPos.x, y: currentPos.y });
  }

  private circleToolCaptureEvents(canvasEl: HTMLCanvasElement) {
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

        if(this.lineStart == false) {
          this.lineStartX =  prevMouseEvent.clientX - rect.left;
          this.lineStartY = prevMouseEvent.clientY - rect.top;
          this.lineStart = true;
        }    
        const currentPos = {
          x: currMouseEvent.clientX - rect.left,
          y: currMouseEvent.clientY - rect.top
        };

        this.drawCircle({x: this.lineStartX, y: this.lineStartY}, currentPos);
      });
  }

  convertCoordinates(coordinates: { x: number; y: number }) {
    let rw = coordinates.x - 1;
    let rh = coordinates.y - 1;
    rw = (rw - rw % this.scaleNum) / this.scaleNum ;
    rh = (rh - rh % this.scaleNum) / this.scaleNum;

    return {x: rw, y: rh};
  }

  // https://www.redblobgames.com/grids/circle-drawing/
  // https://www.varsitytutors.com/hotmath/hotmath_help/topics/equation-of-a-circle
  private inside_circle(center: { x: number; y: number }, tile: { x: number; y: number }, radius: number): boolean {
    let dx = center.x - tile.x,
        dy = center.y - tile.y;
    let distance = Math.sqrt(dx*dx + dy*dy);

    console.log(distance + " " + radius);
    return distance <= radius;
  }

  drawCircle(prevPos: { x: number; y: number }, currentPos: { x: number; y: number }): void {

    let prevCoordinates = this.convertCoordinates(prevPos);
    let curCoordinates = this.convertCoordinates(currentPos);
    Math.pow(4, 0.5)
    let radius = Math.sqrt((curCoordinates.x - prevCoordinates.x) * (curCoordinates.x - prevCoordinates.x) +
                            (curCoordinates.y - prevCoordinates.y) * (curCoordinates.y - prevCoordinates.y)
    ) / 2;

    //console.log(prevCoordinates.x + " " + curCoordinates.x + " " + radius);

    for (let y = 0; y < this.itemBitmap.height / this.scaleNum; y++) {
      for (let x = 0; x < this.itemBitmap.width / this.scaleNum; x++) {
          if (this.inside_circle(prevCoordinates, { x: x, y: y }, radius)) {
            console.log("true " + x + " " + y);
            this.drawColorCell2(x, y);
          }
      }
    }
  }

  private drawColorCell2(x: number, y: number): void {
    if (!this.context) {
      return;
    }
    this.context.fillStyle = this.color;
    this.context.fillRect(x, y, this.scaleNum, this.scaleNum);
    //this.updateBitmap();
  }

  // drawCircle(prevPos: { x: number; y: number }, currentPos: { x: number; y: number }): void {
  //   let center = prevPos
  //   let radius = Math.abs(prevPos.x - currentPos.x);
  //   let top = Math.floor(center.y - radius),
  //   bottom =  Math.ceil(center.y + radius),
  //   left   = Math.floor(center.x - radius),
  //   right  =  Math.ceil(center.x + radius);

  //   for (let y = top; y <= bottom; y++) {
  //       for (let x = left; x <= right; x++) {
  //           if (this.inside_circle(center, { x: x, y: y }, radius)) {
  //             this.drawColorCell(x, y);
  //           }
  //       }
  //   }
  // }  

}
