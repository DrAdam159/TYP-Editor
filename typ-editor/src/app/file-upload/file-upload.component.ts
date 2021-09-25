import { Component, OnInit } from '@angular/core';
import { TypFile } from 'src/TYP_File_lib/TypFile';


@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.css']
})
export class FileUploadComponent implements OnInit {

  fileName: string;
  fileToUpload: File | null;
  typFile!: TypFile;

  constructor() { 
    this.fileToUpload = null;
    this.fileName = '';
  }

  onFileSelected(): void{
    console.log('upload button');
  }

  handleFileInput(event: any): void {
    this.fileToUpload = event.target.files[0];

    if (this.fileToUpload) {
      this.fileName = this.fileToUpload.name;

      var reader = new FileReader();
      //cteni pomoci readAsArrayBuffer, aby na binarni data nebyl aplikovan encoding
      reader.readAsArrayBuffer(this.fileToUpload);

      reader.onload = () => {
        var buffer = reader.result as ArrayBuffer;
        var view = new DataView(buffer);

        this.typFile = new TypFile(view);
      };

      reader.onerror = () => {
        console.log(reader.error);
      };
    }
    
  }

  ngOnInit(): void {
  }

}
