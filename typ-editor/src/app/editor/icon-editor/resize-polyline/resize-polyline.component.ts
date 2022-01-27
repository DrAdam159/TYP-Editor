import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Bitmap } from 'src/TYP_File_lib/Utils/Bitmap';

@Component({
  selector: 'app-resize-polyline',
  templateUrl: './resize-polyline.component.html',
  styleUrls: ['./resize-polyline.component.css']
})
export class ResizePolylineComponent implements OnInit {

  descriptionForm: FormGroup;

  icon: Bitmap;

  newDimensions: {newWidth: number, newHeight: number};

  constructor(@Inject(MAT_DIALOG_DATA) private data: {icon: Bitmap}, private formBuilder: FormBuilder, private dialogRef: MatDialogRef<ResizePolylineComponent>) { 
    this.icon = data.icon;
    this.newDimensions =  {newWidth: 0, newHeight: 0};
    this.descriptionForm = this.formBuilder.group({
      width: [{value: 32, disabled:true}],
      height: [null, [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.descriptionForm.setValue({width: this.icon.width, height: this.icon.height });
  }

  resetForm(form: FormGroup) {
		form.reset();
	}

  onFormSubmit(): void {
    if (this.descriptionForm.valid) {
      this.newDimensions.newWidth = this.descriptionForm.get('width')?.value;
      this.newDimensions.newHeight = this.descriptionForm.get('height')?.value;
      this.dialogRef.close(this.newDimensions);
		} else {
      this.resetForm(this.descriptionForm);
      alert('Invalid data!');
			return;
		}
  }

}
