import { Component, Inject, ViewChild, ElementRef, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Polyline } from 'src/TYP_File_lib/TypFile_blocks/Polyline';
import { Router } from '@angular/router';

@Component({
  selector: 'app-polyline-detail',
  templateUrl: './polyline-detail.component.html',
  styleUrls: ['./polyline-detail.component.css']
})
export class PolylineDetailComponent implements OnInit {

  polyline: Polyline;

  @ViewChild('canvas', {static: false}) 
  myCanvas!: ElementRef<HTMLCanvasElement>;

  context!: CanvasRenderingContext2D | null;

  constructor(@Inject(MAT_DIALOG_DATA) private data: {polyline: Polyline}, private router: Router) {
    this.polyline = data.polyline;
   }

  ngOnInit(): void { }

  openEditor(): void {
    this.router.navigate(['/editor'], {state:{polyline: this.polyline, poi: null, polygone: null} });
  }

}
