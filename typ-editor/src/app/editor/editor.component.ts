import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GraphicElement } from 'src/TYP_File_lib/TypFile_blocks/GeneralDataBlocks/GraphicElement';
import { FileService } from '../services/file.service';
import { fromEvent, Subscription } from 'rxjs';
import { switchMap, takeUntil, pairwise } from 'rxjs/operators';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css']
})
export class EditorComponent implements OnInit, AfterViewInit {

  drawableItem!: GraphicElement;
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
    this.drawBitmapWithGrid();
  }

  drawBitmapWithGrid(): void {
    if(this.drawableItem && this.context) {
      if(this.context) {
        let bmp = this.drawableItem.asBitmap(true);
        this.context.canvas.width = bmp.width *this.scaleNum;
        this.context.canvas.height = bmp.height *this.scaleNum;

      for(let y = 0; y < bmp.height; y++) {
        for(let x = 0; x < bmp.width; x++) {
          this.context.beginPath();
          this.context.fillStyle =  bmp.getPixelColor(x, y).toRgba();
          this.context.fillRect(x *this.scaleNum, y *this.scaleNum, this.scaleNum, this.scaleNum);
          this.context.stroke();
        }
      }
      this.drawGrid(bmp.width *this.scaleNum, bmp.height*this.scaleNum);
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

    for (let pct = 0; pct <= 1; pct += 0.006) {
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
    
    this.context.fillStyle = "red";
    this.context.fillRect(rw, rh, this.scaleNum, this.scaleNum);
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
    this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
    this.drawBitmapWithGrid();
    this.interpolateLine(prevPos, currentPos);
  }
}
