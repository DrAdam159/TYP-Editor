import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GraphicElement } from 'src/TYP_File_lib/TypFile_blocks/GeneralDataBlocks/GraphicElement';
import { FileService } from 'src/app/services/file.service';
import { Subject, Subscription } from 'rxjs';
import {MatTable, MatTableDataSource} from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { IconEditorDescriptionFormComponent } from './icon-editor-description-form/icon-editor-description-form.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Color } from 'src/TYP_File_lib/Utils/Color';

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

enum FontColours {
  No = 0x0,
  Day = 0x8,
  Night = 0x10,
  DayAndNight = 0x18
}

enum Fontdata {
  Default = 0x0,
  Nolabel = 0x1,
  Small = 0x2,
  Normal = 0x3,
  Large = 0x4
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

  @Input() notifier!: Subject<boolean>;

  @Output() unsavedChangesEvent = new EventEmitter<boolean>();

  sub!: Subscription;
  drawableItem!: GraphicElement;

  itemType: string;
  typeID: string;
  subTypeID: string;

  displayedColumns: Array<string>;
  dataSource!: MatTableDataSource<Description>

  tableData: Array<Description>;

  hasFontColors: boolean;
  colorDay: string;
  colorNight: string;

  fontTypes: Array<String>;

  selectedType: Fontdata;

  @ViewChild(MatTable) table!: MatTable<Description>;

  constructor(private fileService: FileService, private Activatedroute: ActivatedRoute, private matDialog: MatDialog) { 

    this.itemType = "";
    this.typeID = "";
    this.subTypeID = "";
    this.tableData = new Array();
    this.hasFontColors = false;
    this.colorDay = '#3f51b5';
    this.colorNight = '#3f51b5';
    this.selectedType = Fontdata.Default;

    this.displayedColumns = ['position', 'code', 'language', 'description', 'delete', 'edit'];

    this.fontTypes = Object.keys(Fontdata).filter(key => isNaN(Number(key)));

  }

  addData() {
    this.matDialog.open( IconEditorDescriptionFormComponent, {
      data: {
        item: this.drawableItem,
        itemCode: 0,
        limit: false
      }
    });
  }

  ngOnInit(): void {
    this.sub = this.Activatedroute.paramMap.subscribe(params => { 
      this.notifier.subscribe(() =>{this.saveChanges()});
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

        if(this.drawableItem.colFontColour.length != 0) {
          this.hasFontColors = true;
          this.selectedType = this.drawableItem.fontType;
          switch(this.drawableItem.fontColType) {
            case FontColours.Day:
              this.colorDay = this.drawableItem.colFontColour[0].toHex();
              break;
            case FontColours.Night:
              this.colorNight = this.drawableItem.colFontColour[1].toHex();
              break;
            case FontColours.DayAndNight:
              this.colorDay = this.drawableItem.colFontColour[0].toHex();
              this.colorNight = this.drawableItem.colFontColour[1].toHex();
              break;
          }
        }
      }
   });
   this.createTableData();
   this.dataSource = new MatTableDataSource([...this.tableData]);

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
    this.dataSource = new MatTableDataSource([...this.tableData]);
    this.table.renderRows();
    this.changeState(true);
  }

  removeItem(itemCode: number): void {
    this.drawableItem.text.textArr =  this.drawableItem.text.textArr.filter(f => f.key !== itemCode);
    this.fileService.updateFile();
    this.updateTableData();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  editItem(itemCode: number): void {
    this.matDialog.open( IconEditorDescriptionFormComponent, {
      data: {
        item: this.drawableItem,
        itemCode: itemCode,
        limit: true
      }
    });
  }

  setFont(): void {
    this.fileService.setFont(new Color(this.colorDay), new Color(this.colorNight),  ~~Fontdata[this.selectedType], this.drawableItem, this.itemType);
  }

  saveChanges(): void {
    if(this.hasFontColors) {
      this.setFont();
    }
    
    this.fileService.updateFile();
    this.changeState(false);
  }

  changeState(state: boolean): void {
    this.unsavedChangesEvent.emit(state);
  }
  
  addFontColors(): void {
    this.hasFontColors = !this.hasFontColors;
    this.changeState(true);
  }

  onFontTypeChange(): void {
    this.changeState(true);
  }

  onColorChange(): void {
    this.changeState(true);
  }

}
