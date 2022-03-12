import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { TypFile } from 'src/TYP_File_lib/TypFile';
import { GraphicElement } from 'src/TYP_File_lib/TypFile_blocks/GeneralDataBlocks/GraphicElement';
import { KeyValuePair } from 'src/TYP_File_lib/TypFile_blocks/GeneralDataBlocks/Multitext';
import { FileService } from '../services/file.service';


export interface ItemData {
  type: string;
  icon: GraphicElement;
  description: KeyValuePair[];
}


@Component({
  selector: 'app-icon-descriptions',
  templateUrl: './icon-descriptions.component.html',
  styleUrls: ['./icon-descriptions.component.css']
})
export class IconDescriptionsComponent implements AfterViewInit {
  displayedColumns: string[] = ['type', 'icon', 'description'];
  dataSource: MatTableDataSource<ItemData>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  file: TypFile;
  bitmapScale: number;

  constructor(private fileService: FileService) {
    // Create 100 users
    //const users = Array.from({length: 100}, (_, k) => createNewUser(k + 1));

    // Assign the data to the data source for the table to render
    //this.dataSource = new MatTableDataSource(users);

    this.file = this.fileService.getFile();
    this.bitmapScale = 5;

    const tableData = this.getTableData();
    this.dataSource = new MatTableDataSource(tableData);
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
    this.file.POIList.forEach(element => {
      data.push({
        type: element.type + " | " + element.subtype,
        icon: element,
        description: element.text.textArr
      });
    });

    this.file.PolygonList.forEach(element => {
      data.push({
        type: element.type + " | " + element.subtype,
        icon: element,
        description: element.text.textArr
      });
    });

    this.file.PolylineList.forEach(element => {
      data.push({
        type: element.type + " | " + element.subtype,
        icon: element,
        description: element.text.textArr
      });
    });

    return data;
  }

}

