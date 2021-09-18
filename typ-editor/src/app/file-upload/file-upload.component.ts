import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.css']
})
export class FileUploadComponent implements OnInit {

  fileName!: string;

  constructor() { }

  onFileSelected(): void{
    console.log('upload button');
  }

  ngOnInit(): void {
  }

}
