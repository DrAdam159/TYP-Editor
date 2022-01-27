import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { FileService } from 'src/app/services/file.service';
import { Polyline } from 'src/TYP_File_lib/TypFile_blocks/Polyline';
import { Bitmap } from 'src/TYP_File_lib/Utils/Bitmap';

@Component({
  selector: 'app-resize-polyline',
  templateUrl: './resize-polyline.component.html',
  styleUrls: ['./resize-polyline.component.css']
})
export class ResizePolylineComponent implements OnInit {

  descriptionForm: FormGroup;

  icon: Bitmap;

  newDimensions: {newWidth: number, newHeight: number, withBitmap: boolean, borderWidth: number, lineWidth: number};

  withBitmap: boolean;

  polyline!: Polyline;

  constructor(@Inject(MAT_DIALOG_DATA) private data: {icon: Bitmap, polyline: Polyline}, private formBuilder: FormBuilder, 
  private dialogRef: MatDialogRef<ResizePolylineComponent>, private fileService: FileService) { 
    this.icon = data.icon;
    this.polyline = data.polyline;
    this.newDimensions =  {newWidth: 0, newHeight: 0, withBitmap: false, borderWidth: 0, lineWidth: 0};
    if(this.polyline.bitmapDay) {
      this.withBitmap = true;
      this.descriptionForm = this.formBuilder.group({
        width: [{value: 32, disabled:true}],
        height: [null, [Validators.required]],
      });
    }
    else {
      this.withBitmap = false;
      this.descriptionForm = this.formBuilder.group({
        width: [{value: 32, disabled:true}],
        height: [null, [Validators.required]],
        borderWidth: [null, [Validators.required]],
        lineWidth: [null, [Validators.required]],
      });
    }
    
  }

  ngOnInit(): void {
    if(this.withBitmap) {
      this.descriptionForm.setValue({width: this.icon.width, height: this.icon.height });
    }
    else {
      this.descriptionForm.setValue({width: this.icon.width, height: this.icon.height,
         borderWidth: this.polyline.borderWidth, lineWidth: this.polyline.innerWidth });
    }
  }

  resetForm(form: FormGroup) {
		form.reset();
	}

  onFormSubmit(): void {
    // if (this.descriptionForm.valid) {
      this.newDimensions.newWidth = this.descriptionForm.get('width')?.value;
      this.newDimensions.newHeight = this.descriptionForm.get('height')?.value;
      this.newDimensions.withBitmap = this.withBitmap;
      if(!this.withBitmap) {
        this.newDimensions.borderWidth = this.descriptionForm.get('borderWidth')?.value;
        this.newDimensions.lineWidth = this.descriptionForm.get('lineWidth')?.value;
      }
      this.dialogRef.close(this.newDimensions);
		// } else {
    //   this.resetForm(this.descriptionForm);
    //   alert('Invalid data!');
		// 	return;
		// }
  }

}
