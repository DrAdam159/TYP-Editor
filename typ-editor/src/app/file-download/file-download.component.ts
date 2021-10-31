import { Component, OnInit } from '@angular/core';
import { saveAs } from "file-saver";
import { FileService } from '../services/file.service';

@Component({
  selector: 'app-file-download',
  templateUrl: './file-download.component.html',
  styleUrls: ['./file-download.component.css']
})
export class FileDownloadComponent implements OnInit {

  isLoaded: boolean;

  constructor(private fileService: FileService) { 
    if(this.fileService.getFile().isEmpty()){
      this.isLoaded = false;
    }
    else {
      this.isLoaded = true;
    }
  }

  ngOnInit(): void {
    this.fileService.notifyObservable$.subscribe(res => {
      if (res.refresh) {
        this.isLoaded = true;
      }
   })
  }

  downloadFile(): void {
    let filename = "editedFile.TYP";
    if(this.fileService.getBLOB()) {
      saveAs(this.fileService.getBLOB(), filename);
    }
    else {
      alert("No file uploaded");
    }
  }
}
