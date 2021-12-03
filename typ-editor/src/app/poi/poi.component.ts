import { Component, OnInit, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { POI } from 'src/TYP_File_lib/TypFile_blocks/POI';
import { FileService } from '../services/file.service';

@Component({
  selector: 'app-poi',
  templateUrl: './poi.component.html',
  styleUrls: ['./poi.component.css']
})
export class PoiComponent implements OnInit {

  poiList!: Array<POI>;

  constructor(private fileService: FileService, private matDialog: MatDialog, private router: Router) { 
   if(this.fileService.getPOIList()) {
      this.poiList = this.fileService.getPOIList();
    }
  }

  ngOnInit(): void {
  }

  openEditor(poiItem: POI): void {
    this.router.navigate(['editor',"poi", poiItem.type, poiItem.subtype ]);
  }

}
