import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.css']
})
export class FileUploadComponent implements OnInit {

  fileName: string;
  fileToUpload: File | null;
  fileContent: Uint8Array | null;

  constructor() { 
    this.fileToUpload = null;
    this.fileName = '';
    this.fileContent = null;
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
        //vysledkem je pole cisel, kde kazde cislo reprezentuje jeden byte
        var buffer = reader.result as ArrayBuffer;
        this.fileContent = new Uint8Array(buffer);
      };

      reader.onerror = () => {
        console.log(reader.error);
      };
    }
    
  }

  ngOnInit(): void {
  }

}
