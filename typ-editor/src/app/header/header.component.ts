import { Component, OnInit } from '@angular/core';
import { TypFile } from 'src/TYP_File_lib/TypFile';
import { FileService } from '../services/file.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  typFile!: TypFile;

  constructor(private fileService: FileService) {
    if(this.fileService.getFile()) {
      this.typFile = fileService.getFile();
    } 
  }

  handleFileLoadedEvent(): void {
    if(this.fileService.getFile()) {
      this.typFile = this.fileService.getFile();
    }
  }

  ngOnInit(): void {
  }

}
