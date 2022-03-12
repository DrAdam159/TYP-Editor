import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { TypFile } from 'src/TYP_File_lib/TypFile';
import { GraphicElement } from 'src/TYP_File_lib/TypFile_blocks/GeneralDataBlocks/GraphicElement';
import { KeyValuePair, LanguageCode } from 'src/TYP_File_lib/TypFile_blocks/GeneralDataBlocks/Multitext';
import { FileService } from '../services/file.service';


export interface ItemData {
  type: string;
  icon: GraphicElement;
  description: Map<string, string>;
}


@Component({
  selector: 'app-icon-descriptions',
  templateUrl: './icon-descriptions.component.html',
  styleUrls: ['./icon-descriptions.component.css']
})
export class IconDescriptionsComponent implements AfterViewInit {
  displayedColumns: string[] /*= ['type', 'icon', 'description']*/;
  dataSource: MatTableDataSource<ItemData>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  file: TypFile;
  bitmapScale: number;
  languages: string[];
  languageCodes: number[];

  constructor(private fileService: FileService) {

    this.file = this.fileService.getFile();
    this.bitmapScale = 2;

    this.languages = this.fileService.getLanguages();
    this.languageCodes = this.fileService.getLanguageCodes();

    const tableData = this.getTableData();
    this.dataSource = new MatTableDataSource(tableData);

    // this.languages = this.getLanguages();
    this.displayedColumns = ['type', 'icon'].concat(this.languages);
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  getTableData(): ItemData[] {
    const data = new Array<ItemData>();

    this.file.PolygonList.forEach(polygone => {
      const map = new Map();
      polygone.text.textArr.forEach(element => {
        map.set(LanguageCode[element.key], element.value);
      });
      data.push({
        type: polygone.type + " | " + polygone.subtype,
        icon: polygone,
        description: map 
      });
    }); 

    this.file.POIList.forEach(poi => {
      const map = new Map();
      poi.text.textArr.forEach(element => {
        map.set(LanguageCode[element.key], element.value);
      });
      data.push({
        type: poi.type + " | " + poi.subtype,
        icon: poi,
        description: map 
      });
    });  

    this.file.PolylineList.forEach(polyline => {
      const map = new Map();
      polyline.text.textArr.forEach(element => {
        map.set(LanguageCode[element.key], element.value);
      });
      data.push({
        type: polyline.type + " | " + polyline.subtype,
        icon: polyline,
        description: map 
      });
    });  
    return data;
  }

  getSmth(language: string): string {
    return language;
  }

}

