import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GraphicElement } from 'src/TYP_File_lib/TypFile_blocks/GeneralDataBlocks/GraphicElement';
import { FileService } from '../services/file.service';
import { fromEvent } from 'rxjs';
import { switchMap, takeUntil, pairwise } from 'rxjs/operators';

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
    if(this.drawableItem) {
      this.context = this.myCanvas.nativeElement.getContext('2d');

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
        for(let y = 0; y < bmp.height; y++) {
          for(let x = 0; x < bmp.width; x++) {
            this.context.beginPath();
            this.context.strokeStyle = "#FF0000";
            this.context.rect(x *this.scaleNum, y *this.scaleNum, this.scaleNum, this.scaleNum);
            this.context.stroke();
          }
        }
      this.drawGrid(bmp.width *this.scaleNum, bmp.height*this.scaleNum);
      }
    }
    
    const canvasEl: HTMLCanvasElement = this.myCanvas?.nativeElement;
    this.captureEvents(canvasEl);
  }

  private captureEvents(canvasEl: HTMLCanvasElement) {
    fromEvent(canvasEl, 'mousedown')
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

        this.drawOnCanvas(prevPos, currentPos);
      });
  }

  private drawOnCanvas(prevPos: { x: number; y: number },currentPos: { x: number; y: number }): void {
    if (!this.context) {
      return;
    }

    for (let pct = 0; pct <= 1; pct += 0.06) {
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
    rw = rw - rw % this.scaleNum + 0.5;
    rh = rh - rh % this.scaleNum + 0.5;
    
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
}
