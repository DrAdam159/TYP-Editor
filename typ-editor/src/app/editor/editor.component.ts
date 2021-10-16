import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Polyline } from 'src/TYP_File_lib/TypFile_blocks/Polyline';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css']
})
export class EditorComponent implements OnInit, AfterViewInit {

  editItem!: Polyline;
  tmp!: Polyline;

  @ViewChild('canvas', {static: false}) 
  myCanvas!: ElementRef<HTMLCanvasElement>;

  context!: CanvasRenderingContext2D | null;

  constructor() { }

  ngOnInit(): void {
    this.editItem = window.history.state;
    this.tmp = new Polyline(this.editItem.type, this.editItem.subtype);
    this.tmp.copy(this.editItem);
  }

  ngAfterViewInit(): void {
    this.context = this.myCanvas.nativeElement.getContext('2d');

    if(this.context) {
      let bmp = this.tmp.asBitmap(true);
      this.context.canvas.width = bmp.width *40;
      this.context.canvas.height = bmp.height *40;
      /*this.context.rect(0, 0, bmp.width *40, bmp.height *40);
      this.context.fillStyle = "#ccd5e3";
      this.context.fill();*/

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
