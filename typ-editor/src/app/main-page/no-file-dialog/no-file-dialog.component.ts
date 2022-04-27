import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { FileNewDialogComponent } from 'src/app/file-new/file-new-dialog/file-new-dialog.component';
import { FileService } from 'src/app/services/file.service';
import { TypFile } from 'src/TYP_File_lib/TypFile';

@Component({
  selector: 'app-no-file-dialog',
  templateUrl: './no-file-dialog.component.html',
  styleUrls: ['./no-file-dialog.component.css']
})
export class NoFileDialogComponent implements OnInit {

  fileToUpload!: File;
  fileName: string;
  typFile!: TypFile;

  constructor(public dialog: MatDialog, private fileService: FileService, private router: Router, public dialogRef: MatDialogRef<NoFileDialogComponent>) {
    this.fileName = '';
   }

  ngOnInit(): void {
  }

  newFile(): void {
    this.dialog.open(FileNewDialogComponent);
  }

  handleFileInput(event: any): void {
    this.fileToUpload = event.target.files[0];

    if (this.fileToUpload) {
      this.fileName = this.fileToUpload.name;
      const fileExtension = this.fileName.split('.').pop()?.toLowerCase()
      // console.log(fileExtension);
      if(fileExtension == "typ" ) {
        const reader = new FileReader();
        //cteni pomoci readAsArrayBuffer, aby na binarni data nebyl aplikovan encoding
        reader.readAsArrayBuffer(this.fileToUpload);

        reader.onload = () => {
          const buffer = reader.result as ArrayBuffer;
          const view = new DataView(buffer);
          //console.log(buffer);
          

          this.typFile = new TypFile(view);
          this.fileService.setFile(this.typFile, this.fileName, buffer);
          this.refreshAnotherComponent();
          this.dialogRef.close();
          this.router.navigate(['']);
        };

        reader.onerror = () => {
          console.log(reader.error);
        };
      }
    }
  }

  refreshAnotherComponent() {
    this.fileService.notifyOther({
       refresh: true
    });
 }

}
