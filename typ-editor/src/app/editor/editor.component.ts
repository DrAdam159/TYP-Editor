import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GraphicElement } from 'src/TYP_File_lib/TypFile_blocks/GeneralDataBlocks/GraphicElement';
import { FileService } from '../services/file.service';
import { fromEvent, Subscription } from 'rxjs';
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
  itemBitmap!: Bitmap;
  undoQuery: Array<Bitmap>;
  redoQuery: Array<Bitmap>;
  sub: any;

  @ViewChild('canvas', {static: false}) 
  myCanvas!: ElementRef<HTMLCanvasElement>;
  context!: CanvasRenderingContext2D | null;

  scaleNum: number;

  toolOptions = new FormControl();
  mouseSub!: Subscription;

  lineStart: boolean = false;
  lineStartX: number = 0;
  lineStartY: number = 0;

  constructor(private fileService: FileService, private Activatedroute: ActivatedRoute) {
    this.scaleNum = 20;
    this.undoQuery = new Array();
    this.redoQuery = new Array();
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

  private interpolateLine(prevPos: { x: number; y: number }, currentPos: { x: number; y: number }): void {
    if (!this.context) {
      return;
    }

    for (let pct = 0; pct <= 1; pct += 0.03) {
      let dx = currentPos.x - prevPos.x;
      let dy = currentPos.y - prevPos.y;
      let X = prevPos.x + dx * pct;
      let Y = prevPos.y + dy * pct;
      if (!(X == prevPos.x && Y == prevPos.y)) {
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
    
    this.context.fillStyle = "red";
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
      this.itemBitmap.fill(rw, rh, new Color(255,0,0,255));
      this.updateBitmap();
    }
  }

  storeBitmap(): void {
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
