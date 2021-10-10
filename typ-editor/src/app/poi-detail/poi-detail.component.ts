import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { POI } from 'src/TYP_File_lib/TypFile_blocks/POI';

@Component({
  selector: 'app-poi-detail',
  templateUrl: './poi-detail.component.html',
  styleUrls: ['./poi-detail.component.css']
})
export class PoiDetailComponent implements OnInit {

  poi: POI;

  constructor(@Inject(MAT_DIALOG_DATA) private data: POI) { 
    this.poi = data;
  }

  ngOnInit(): void {
  }

}
