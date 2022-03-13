import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Title } from '@angular/platform-browser';
import { MtxProgressType } from '@ng-matero/extensions/progress';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { Header } from 'src/TYP_File_lib/TypFile_blocks/Header';
import { FileService } from '../services/file.service';

export interface Icon {
  iconType: string;
  totalCount: number;
  nightIconCount: number;
  bitmapCount: number;
}

@Component({
  selector: 'main-page-header',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.css']
})

export class MainPageComponent implements OnInit {

  loadedFile: boolean;

  fileHeader!: Header;
  fileName: string;
  fileSize: string;

  poiCount: number;
  polylineCount: number;
  polygoneCount: number;

  creationDate: string;

  displayedColumns: string[] = ['iconType', 'totalCount', 'nightIconCount', 'bitmapCount'];
  tableData: Array<Icon>;
  dataSource: MatTableDataSource<Icon>;
  

  public pieChartOptions: ChartConfiguration['options'];
  public pieChartData: ChartData<'pie', number[], string | string[]>;
  public pieChartType: ChartType = 'pie';
  public pieChartLegend = true;

  public doughnutChartLabels: string[] = [ 'Used Space', 'Empty Space'];
  public doughnutChartData: ChartData<'doughnut'> = {
    labels: this.doughnutChartLabels,
    datasets: [
      { data: [ 5, 100] },
    ]
  };
  public doughnutChartType: ChartType = 'doughnut';

  constructor(private fileService: FileService, private titleService: Title) {
    this.titleService.setTitle('Main Page');
    this.tableData = new Array();
    if(this.fileService.getFileName() != '') {
      this.fileHeader = this.fileService.getHeader();
      this.fileName = this.fileService.getFileName();
      this.poiCount = this.fileService.getPOIList().length;
      this.polylineCount = this.fileService.getPolylineList().length;
      this.polygoneCount = this.fileService.getPolygoneList().length;
      this.loadedFile = true;
      this.fileSize = (this.fileService.getFileSize() / (1024)).toFixed(2);
      this.creationDate = this.fileHeader.creationDate.toLocaleString();
      this.fillTableData();
      this.dataSource = new MatTableDataSource(this.tableData);
    }
    else {
      this.loadedFile = false;
      this.fileName = "Undefined";
      this.poiCount = 0;
      this.polylineCount = 0;
      this.polygoneCount = 0;
      this.fileSize = "0";
      this.creationDate = "";
      this.dataSource = new MatTableDataSource(this.tableData);
    }
      // Pie
    this.pieChartOptions = {
      responsive: true,
      plugins: {
        legend: {
          display: true,
          position: 'top',
        },
      }
    };
    this.pieChartData = {
      labels: [  'POIs', 'Polygones', 'Polylines' ],
      datasets: [ {
        data: [ this.poiCount, this.polygoneCount, this.polylineCount ]
      } ]
    };
  }

  ngOnInit(): void {
    this.fileService.notifyObservable$.subscribe(res => {
      if (res.refresh) {
        this.load();
      }
   });
  }

  load(): void {
    this.loadedFile = true;
    this.fileHeader = this.fileService.getHeader();
    this.fileName = this.fileService.getFileName();
    this.poiCount = this.fileService.getPOIList().length;
    this.polylineCount = this.fileService.getPolylineList().length;
    this.polygoneCount = this.fileService.getPolygoneList().length;
    this.fileSize = (this.fileService.getFileSize() / (1024)).toFixed(2);
    this.creationDate = this.fileHeader.creationDate.toLocaleString();
    this.updateTableData();

    this.pieChartData = {
      labels: [  'POIs', 'Polygones', 'Polylines' ],
      datasets: [ {
        data: [ this.poiCount, this.polygoneCount, this.polylineCount ]
      } ]
    };
  }

  updateTableData(): void {
    this.tableData.splice(0, this.tableData.length);
    this.fillTableData();
    this.dataSource = new MatTableDataSource([...this.tableData]);
  }

  fillTableData(): void {
    this.polylineStats();
    this.polygoneStats();
    this.poiStats();
  }

  polylineStats(): void {
    let nightCount = 0;
    let bitmapCount = 0;
    this.fileService.getPolylineList().forEach(element => {
      if(element.bitmapDay) {
        bitmapCount++;
      }
      if(element.bitmapNight || element.colNightColor.length != 0) {
        nightCount++;
      }
    });
    this.tableData.push({iconType: 'Polyline', totalCount: this.polylineCount, nightIconCount: nightCount, bitmapCount: bitmapCount});
  }

  polygoneStats(): void {
    let nightCount = 0;
    let bitmapCount = 0;
    this.fileService.getPolygoneList().forEach(element => {
      if(element.bitmapDay) {
        bitmapCount++;
      }
      if(element.bitmapNight || element.colNightColor.length != 0) {
        nightCount++;
      }
    });
    this.tableData.push({iconType: 'Polygone', totalCount: this.polygoneCount, nightIconCount: nightCount, bitmapCount: bitmapCount});
  }

  poiStats(): void {
    let nightCount = 0;
    let bitmapCount = 0;
    this.fileService.getPolygoneList().forEach(element => {
      if(element.bitmapDay) {
        bitmapCount++;
      }
      if(element.bitmapNight || element.colNightColor.length != 0) {
        nightCount++;
      }
    });
    this.tableData.push({iconType: 'POI', totalCount: this.poiCount, nightIconCount: nightCount, bitmapCount: this.poiCount});
  }

}
