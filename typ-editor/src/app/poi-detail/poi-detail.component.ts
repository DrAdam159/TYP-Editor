import { Component, Inject, ViewChild, ElementRef, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { POI } from 'src/TYP_File_lib/TypFile_blocks/POI';
import { Router } from '@angular/router';

@Component({
  selector: 'app-poi-detail',
  templateUrl: './poi-detail.component.html',
  styleUrls: ['./poi-detail.component.css']
})
export class PoiDetailComponent implements OnInit {

  poi: POI;

  @ViewChild('canvas', {static: false}) 
  myCanvas!: ElementRef<HTMLCanvasElement>;

  context!: CanvasRenderingContext2D | null;

  constructor(@Inject(MAT_DIALOG_DATA) private data: {poi: POI}, private router: Router) { 
    this.poi = data.poi;
  }

  ngOnInit(): void { }

  openEditor(): void {
    this.router.navigate(['/editor'], {state:{itemType: "poi", type: this.poi.type, subtype: this.poi.subtype} });
  }

}
