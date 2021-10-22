import { Component,  OnInit, Inject, ViewChild, ElementRef } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Polygon } from 'src/TYP_File_lib/TypFile_blocks/Polygon';

@Component({
  selector: 'app-polygone-detail',
  templateUrl: './polygone-detail.component.html',
  styleUrls: ['./polygone-detail.component.css']
})
export class PolygoneDetailComponent implements OnInit {

  polygone: Polygon;

  @ViewChild('canvas', {static: false}) 
  myCanvas!: ElementRef<HTMLCanvasElement>;

  context!: CanvasRenderingContext2D | null;

  constructor(@Inject(MAT_DIALOG_DATA) private data: {polygone: Polygon}, private router: Router) { 
    this.polygone = data.polygone;
  }

  ngOnInit(): void { }

  openEditor(): void {
    //this.router.navigate(['/editor'], {state:{...this.polyline} });
    this.router.navigate(['/editor'], {state:{itemType: "polygone", type: this.polygone.type, subtype: this.polygone.subtype} });
  }
}
