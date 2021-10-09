import { Component, OnInit } from '@angular/core';
import { TypFile } from 'src/TYP_File_lib/TypFile';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  typFile!: TypFile;

  constructor() { 
  }

  handleFileLoadedEvent(newFile: any): void {
    this.typFile = newFile;
  }

  ngOnInit(): void {
  }

}
