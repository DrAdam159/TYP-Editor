import { Component, OnInit, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Polygon } from 'src/TYP_File_lib/TypFile_blocks/Polygon';
import { FileService } from '../services/file.service';

@Component({
  selector: 'app-polygone',
  templateUrl: './polygone.component.html',
  styleUrls: ['./polygone.component.css']
})
export class PolygoneComponent implements OnInit {

  polygoneList!: Array<Polygon>;

  constructor(private fileService: FileService, private matDialog: MatDialog, private router: Router) { 
    if(this.fileService.getPOIList()) {
      this.polygoneList = this.fileService.getPolygoneList();
    }
  }

  ngOnInit(): void {
  }

  openEditor(polygoneItem: Polygon): void {
    this.router.navigate(['editor',"polygone", polygoneItem.type, polygoneItem.subtype ]);
  }

}
