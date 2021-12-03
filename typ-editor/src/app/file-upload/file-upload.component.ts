import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { TypFile } from 'src/TYP_File_lib/TypFile';
import { FileService } from '../services/file.service';


@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.css']
})
export class FileUploadComponent implements OnInit {

  fileName: string;
  fileToUpload!: File;
  typFile!: TypFile;

  @Output() fileLoadedEvent: EventEmitter<TypFile>;

  constructor(private fileService: FileService, private router: Router) {
    this.fileLoadedEvent = new EventEmitter<TypFile>();
    //this.fileToUpload = null;

    if(this.fileService.getFileName()) {
      this.fileName = this.fileService.getFileName();
    }
    else {
      this.fileName = '';
    }
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
        this.fileService.setFile(this.typFile, this.fileName, buffer);
        this.refreshAnotherComponent();
        this.router.navigate(['']);
      };

      reader.onerror = () => {
        console.log(reader.error);
      };
    }
    
  }

  refreshAnotherComponent() {
    this.fileService.notifyOther({
       refresh: true
    });
 }

  ngOnInit(): void {
  }

}
