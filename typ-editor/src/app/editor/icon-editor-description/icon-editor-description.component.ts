import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GraphicElement } from 'src/TYP_File_lib/TypFile_blocks/GeneralDataBlocks/GraphicElement';
import { FileService } from 'src/app/services/file.service';
import { Subscription } from 'rxjs';
import {MatTable} from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { IconEditorDescriptionFormComponent } from './icon-editor-description-form/icon-editor-description-form.component';

enum LanguageCode {
  unspecified = 0x00,
  french = 0x01,
  german = 0x02,
  dutch = 0x03,
  english = 0x04,
  italian = 0x05,
  finnish = 0x06,
  swedish = 0x07,
  spanish = 0x08,
  basque = 0x09,
  catalan = 0x0a,
  galician = 0x0b,
  welsh = 0x0c,
  gaelic = 0x0d,
  danish = 0x0e,
  norwegian = 0x0f,
  portuguese = 0x10,
  slovak = 0x11,
  czech = 0x12,
  croatian = 0x13,
  hungarian = 0x14,
  polish = 0x15,
  turkish = 0x16,
  greek = 0x17,
  slovenian = 0x18,
  russian = 0x19,
  estonian = 0x1a,
  latvian = 0x1b,
  romanian = 0x1c,
  albanian = 0x1d,
  bosnian = 0x1e,
  lithuanian = 0x1f,
  serbian = 0x20,
  macedonian = 0x21,
  bulgarian = 0x22
}

interface Description {
  position: number;
  code: number;
  language: string;
  description: string;

}

@Component({
  selector: 'app-icon-editor-description',
  templateUrl: './icon-editor-description.component.html',
  styleUrls: ['./icon-editor-description.component.css']
})
export class IconEditorDescriptionComponent implements OnInit {

  sub!: Subscription;
  drawableItem!: GraphicElement;

  itemType: string;
  typeID: string;
  subTypeID: string;

  displayedColumns: Array<string>;
  dataSource: Array<Description>;

  tableData: Array<Description>;

  @ViewChild(MatTable) table!: MatTable<Description>;

  constructor(private fileService: FileService, private Activatedroute: ActivatedRoute, private matDialog: MatDialog) { 

    this.itemType = "";
    this.typeID = "";
    this.subTypeID = "";
    this.tableData = new Array();

    this.displayedColumns = ['position', 'code', 'language', 'description', 'delete'];
    this.dataSource = new Array();

  }

  addData() {
    this.matDialog.open( IconEditorDescriptionFormComponent, {
      data: {
        item: this.drawableItem
      }
    });
  }

  ngOnInit(): void {
    this.sub = this.Activatedroute.paramMap.subscribe(params => { 
      this.itemType = params.get('id') || "";
      this.typeID = params.get('id1') || "";
      this.subTypeID = params.get('id2') || "";

      if(this.itemType && this.typeID && this.subTypeID) {
        switch(this.itemType) {
          case 'polyline':
            this.drawableItem = this.fileService.getPolyline(~~this.typeID, ~~this.subTypeID);
            break;
          case 'polygone':
            this.drawableItem = this.fileService.getPolygone(~~this.typeID, ~~this.subTypeID);
            break;
          case 'poi':
            this.drawableItem = this.fileService.getPOI(~~this.typeID, ~~this.subTypeID);
            break;
          default:
            new Error("No item type supplied!");
        }
      }
   });

   this.createTableData();
   this.dataSource = [...this.tableData];

   this.fileService.notifyObservable$.subscribe(res => {
    if (res.refresh) {
       this.updateTableData();
    }
  })
  }

  createTableData(): void {
    this.drawableItem.text.textArr.forEach((item, index) => {
      this.tableData.push({position: index, code: item.key, language: LanguageCode[item.key], description: item.value});
    });
  }

  updateTableData(): void {
    this.tableData.splice(0, this.tableData.length);
    this.createTableData();
    this.dataSource = [...this.tableData];
    this.table.renderRows();
  }

  removeItem(itemCode: number): void {
    console.log(itemCode);
    this.drawableItem.text.textArr =  this.drawableItem.text.textArr.filter(f => f.key !== itemCode);
    this.fileService.updateFile();
    this.updateTableData();
  }

}
