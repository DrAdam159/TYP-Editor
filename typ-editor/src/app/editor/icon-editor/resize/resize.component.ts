import { Component, Inject, OnInit} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Bitmap } from 'src/TYP_File_lib/Utils/Bitmap';

@Component({
  selector: 'app-resize',
  templateUrl: './resize.component.html',
  styleUrls: ['./resize.component.css']
})
export class ResizeComponent implements OnInit {

  descriptionForm: FormGroup;

  icon: Bitmap;

  newDimensions: {newWidth: number, newHeight: number};

  constructor(@Inject(MAT_DIALOG_DATA) private data: {icon: Bitmap}, private formBuilder: FormBuilder, private dialogRef: MatDialogRef<ResizeComponent>) { 
    this.icon = data.icon;
    this.newDimensions =  {newWidth: 0, newHeight: 0};
    this.descriptionForm = this.formBuilder.group({
      width: [null, [Validators.required]],
      height: [null, [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.descriptionForm.setValue({width: this.icon.width, height: this.icon.height });
  }

  calculateAspectRatioHeight(): void {
    const newHeight = this.descriptionForm.get('height')?.value;
    const newWidth = Math.round((newHeight / (this.icon.height / this.icon.width)));
    this.descriptionForm.setValue({width: newWidth, height: newHeight });
  }

  calculateAspectRatioWidth(): void {
    const newWidth = this.descriptionForm.get('width')?.value;
    const newHeight = Math.round((this.icon.height / this.icon.width * newWidth));
    this.descriptionForm.setValue({width: newWidth, height: newHeight });
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
