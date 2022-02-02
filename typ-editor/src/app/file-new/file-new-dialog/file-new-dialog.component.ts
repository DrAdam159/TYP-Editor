import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { FileService } from 'src/app/services/file.service';

@Component({
  selector: 'app-file-new-dialog',
  templateUrl: './file-new-dialog.component.html',
  styleUrls: ['./file-new-dialog.component.css']
})
export class FileNewDialogComponent implements OnInit {

  descriptionForm: FormGroup;

  constructor(private fileService: FileService, private formBuilder: FormBuilder, private router: Router, private dialogRef: MatDialogRef<FileNewDialogComponent>) {
    this.descriptionForm = this.formBuilder.group({
      fileName: ['', [Validators.required]],
      pid: [null, [Validators.required]],
      fid: [null, [Validators.required]]
    });
   }

  ngOnInit(): void {
  }

  resetForm(form: FormGroup) {
		form.reset();
	}

  onFormSubmit() {
    if (this.descriptionForm.valid) { 
      const fileName: string = this.descriptionForm.get('fileName')?.value;
      const pid: number  = this.descriptionForm.get('pid')?.value;
      const fid: number = this.descriptionForm.get('fid')?.value;
      this.fileService.createFile(fileName, pid, fid);
      this.dialogRef.close();
      this.refreshAnotherComponent();
      this.router.navigate(['']);

    }
    else {
      this.resetForm(this.descriptionForm);
      alert('Invalid data!');
			return;
    }
  } 

  refreshAnotherComponent() {
    this.fileService.notifyOther({
       refresh: true
    });
 }

}
