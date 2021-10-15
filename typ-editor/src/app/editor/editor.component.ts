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
      this.context.rect(0, 0, 600, 300);
      this.context.fillStyle = "#ccd5e3";
      this.context.fill();
      let bmp = this.tmp.asBitmap(true);
      //this.context.putImageData(bmp.getImageData(), 300, 150);

      createImageBitmap(bmp.getImageData()).then((imgBitmap) => {
        if(this.context) {
          this.context.drawImage(imgBitmap, 20, 20, bmp.width * 10, bmp.height * 10);
        }
    });
    }
  }

}
