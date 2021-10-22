import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { GraphicElement } from 'src/TYP_File_lib/TypFile_blocks/GeneralDataBlocks/GraphicElement';
import { FileService } from '../services/file.service';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css']
})
export class EditorComponent implements OnInit, AfterViewInit {

  drawableItem!: GraphicElement;

  @ViewChild('canvas', {static: false}) 
  myCanvas!: ElementRef<HTMLCanvasElement>;

  context!: CanvasRenderingContext2D | null;

  constructor(private fileService: FileService) { }

  ngOnInit(): void {
    switch(window.history.state.itemType) {
      case 'polyline':
        this.drawableItem = this.fileService.getPolyline(window.history.state.type, window.history.state.subtype);
        break;
      case 'polygone':
        this.drawableItem = this.fileService.getPolygone(window.history.state.type, window.history.state.subtype);
        break;
      case 'poi':
        this.drawableItem = this.fileService.getPOI(window.history.state.type, window.history.state.subtype);
        break;
      default:
        new Error("No item type supplied!");
    }
    
  }

  ngAfterViewInit(): void {
    if(this.drawableItem) {
      this.context = this.myCanvas.nativeElement.getContext('2d');

      if(this.context) {
        let bmp = this.drawableItem.asBitmap(true);
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
