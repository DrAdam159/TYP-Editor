import { Component, OnInit } from '@angular/core';
import { Header } from 'src/TYP_File_lib/TypFile_blocks/Header';
import { FileService } from '../services/file.service';

@Component({
  selector: 'app-file-header',
  templateUrl: './file-header.component.html',
  styleUrls: ['./file-header.component.css']
})
export class FileHeaderComponent implements OnInit {

  fileHeader!: Header;

  constructor(private fileService: FileService) {
    if(this.fileService.getHeader()) {
      this.fileHeader = this.fileService.getHeader();
    }
  }

  ngOnInit(): void {
  }

}
