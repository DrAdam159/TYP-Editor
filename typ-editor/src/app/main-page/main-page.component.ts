import { Component, OnInit, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { Header } from 'src/TYP_File_lib/TypFile_blocks/Header';
import { FileService } from '../services/file.service';

@Component({
  selector: 'main-page-header',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.css']
})
export class MainPageComponent implements OnInit {

  loadedFile: boolean;

  fileHeader!: Header;
  fileName: string;

  poiCount: number;
  polylineCount: number;
  polygoneCount: number;

  public pieChartOptions: ChartConfiguration['options'];
  public pieChartData: ChartData<'pie', number[], string | string[]>;
  public pieChartType: ChartType = 'pie';
  public pieChartLegend = true;

  constructor(private fileService: FileService, private titleService: Title) {
    this.titleService.setTitle('Main Page');
    if(this.fileService.getFileName() != '') {
      this.fileHeader = this.fileService.getHeader();
      this.fileName = this.fileService.getFileName();
      this.poiCount = this.fileService.getPOIList().length;
      this.polylineCount = this.fileService.getPolylineList().length;
      this.polygoneCount = this.fileService.getPolygoneList().length;
      this.loadedFile = true;
    }
    else {
      this.loadedFile = false;
      this.fileName = "Undefined";
      this.poiCount = 0;
      this.polylineCount = 0;
      this.polygoneCount = 0;
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

    this.pieChartData = {
      labels: [  'POIs', 'Polygones', 'Polylines' ],
      datasets: [ {
        data: [ this.poiCount, this.polygoneCount, this.polylineCount ]
      } ]
    };
  }

}
