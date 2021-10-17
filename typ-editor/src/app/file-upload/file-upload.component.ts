import { Component, EventEmitter, OnInit, Output } from '@angular/core';
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

  @Output() fileLoadedEvent: EventEmitter<TypFile>;

  constructor() {
    this.fileLoadedEvent = new EventEmitter<TypFile>();
    this.fileToUpload = null;
    this.fileName = '';
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
        console.log(buffer);
        this.typFile = new TypFile(view);
        this.fileLoadedEvent.emit(this.typFile);
      };

      reader.onerror = () => {
        console.log(reader.error);
      };
    }
    
  }

  ngOnInit(): void {
  }

}
