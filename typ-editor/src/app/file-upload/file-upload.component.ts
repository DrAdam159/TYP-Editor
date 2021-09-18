import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.css']
})
export class FileUploadComponent implements OnInit {

  fileName: string;
  fileToUpload: File | null;
  fileContent: string;
  fileContent2: Uint8Array | null;

  constructor() { 
    this.fileToUpload = null;
    this.fileName = '';
    this.fileContent = '';
    this.fileContent2 = null;
  }

  onFileSelected(): void{
    console.log('upload button');
  }

  handleFileInput(event: any): void {
    this.fileToUpload = event.target.files[0];

    if (this.fileToUpload) {
      this.fileName = this.fileToUpload.name;
      console.log(this.fileToUpload);

      var reader = new FileReader();
      reader.readAsArrayBuffer(this.fileToUpload);
      //reader.readAsText(this.fileToUpload);

      reader.onload = () => {
        //this.fileContent = reader.result as string;
        //console.log(this.fileContent);

        var buffer = reader.result as ArrayBuffer;
        this.fileContent2 = new Uint8Array(buffer);
      };

      reader.onerror = () => {
        console.log(reader.error);
      };
    }
    
  }

  ngOnInit(): void {
  }

}
