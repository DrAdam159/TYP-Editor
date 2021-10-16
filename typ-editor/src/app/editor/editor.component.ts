import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { POI } from 'src/TYP_File_lib/TypFile_blocks/POI';
import { Polygon } from 'src/TYP_File_lib/TypFile_blocks/Polygon';
import { Polyline } from 'src/TYP_File_lib/TypFile_blocks/Polyline';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css']
})
export class EditorComponent implements OnInit, AfterViewInit {

  polyline!: Polyline;
  poi!: POI;
  polygone!: Polygon;
  tmp!: Polyline | POI | Polygon;

  @ViewChild('canvas', {static: false}) 
  myCanvas!: ElementRef<HTMLCanvasElement>;

  context!: CanvasRenderingContext2D | null;

  constructor() { }

  ngOnInit(): void {
    if (window.history.state.polyline) {
      this.polyline = window.history.state.polyline;
      this.tmp = new Polyline(this.polyline.type, this.polyline.subtype);
      this.tmp.copy(this.polyline);
    } 
    else if(window.history.state.poi) {
      this.poi = window.history.state.poi;
      this.tmp = new POI(this.poi.type, this.poi.subtype);
      this.tmp.copy(this.poi);
    } 
    else if(window.history.state.polygone) {
      this.polygone = window.history.state.polygone;
      this.tmp = new Polygon(this.polygone.type, this.polygone.subtype);
      this.tmp.copy(this.polygone);
    }
  }

  ngAfterViewInit(): void {
    if(this.tmp) {
      this.context = this.myCanvas.nativeElement.getContext('2d');

      if(this.context) {
        let bmp = this.tmp.asBitmap(true);
        this.context.canvas.width = bmp.width *40;
        this.context.canvas.height = bmp.height *40;

      for(let y = 0; y < bmp.height; y++) {
        for(let x = 0; x < bmp.width; x++) {
          this.context.beginPath();
          this.context.fillStyle =  bmp.getPixelColor(x, y).toRgba();
          this.context.fillRect(x *40, y *40, 40, 40);
          this.context.stroke();
        }
      }
        for(let y = 0; y < bmp.height; y++) {
          for(let x = 0; x < bmp.width; x++) {
            this.context.beginPath();
            this.context.strokeStyle = "#FF0000";
            this.context.rect(x *40, y *40, 40, 40);
            this.context.stroke();
          }
        }
      }
    }
    
  }

}
