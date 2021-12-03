import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Polyline } from 'src/TYP_File_lib/TypFile_blocks/Polyline';
import { FileService } from '../services/file.service';

@Component({
  selector: 'app-polyline',
  templateUrl: './polyline.component.html',
  styleUrls: ['./polyline.component.css']
})
export class PolylineComponent implements OnInit {

  polylineList!: Array<Polyline>;

  constructor(private fileService: FileService, private matDialog: MatDialog, private router: Router) { 
    if(this.fileService.getPOIList()) {
      this.polylineList = this.fileService.getPolylineList();
    }
  }

  ngOnInit(): void {
    this.fileService.notifyObservable$.subscribe(res => {
      if (res.refresh) {
         this.polylineList = this.fileService.getPolylineList();
      }
   })
  }

  openEditor(polylineItem: Polyline): void {
    this.router.navigate(['editor',"polyline", polylineItem.type, polylineItem.subtype ]);
  }
}
