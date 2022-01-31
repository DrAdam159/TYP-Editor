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

  newDimensions: {
    newWidth: number, 
    newHeight: number, 
    newCanvasWidth: number, 
    newCanvasHeight: number,
    rescaled: boolean,
    resized: boolean
  };

  constructor(@Inject(MAT_DIALOG_DATA) private data: {icon: Bitmap}, private formBuilder: FormBuilder, private dialogRef: MatDialogRef<ResizeComponent>) { 
    this.icon = data.icon;
    this.newDimensions =  {newWidth: 0, newHeight: 0, newCanvasWidth: 0, newCanvasHeight: 0, rescaled: false, resized: false};
    this.descriptionForm = this.formBuilder.group({
      width: [null, [Validators.required]],
      height: [null, [Validators.required]],
      canvasWidth: [null, [Validators.required]],
      canvasHeight: [null, [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.descriptionForm.setValue({width: this.icon.width, height: this.icon.height,
      canvasWidth: this.icon.width *20, canvasHeight: this.icon.height *20});
  }

  calculateAspectRatioHeight(): void {
    const newHeight = this.descriptionForm.get('height')?.value;
    const newWidth = Math.round((newHeight / (this.icon.height / this.icon.width)));
    this.descriptionForm.setValue({width: newWidth, height: newHeight });
  }

  calculateAspectRatioWidth(): void {
    const newWidth = this.descriptionForm.get('width')?.value;
    const newHeight = Math.round((this.icon.height / this.icon.width * newWidth));
    this.descriptionForm.setValue({width: newWidth, height: newHeight, canvasWidth: this.icon.width *20, canvasHeight: this.icon.height *20 });
  }

  resetForm(form: FormGroup) {
		form.reset();
	}

  onFormSubmit(): void {
    if (this.descriptionForm.valid) {
      this.newDimensions.newWidth = this.descriptionForm.get('width')?.value;
      this.newDimensions.newHeight = this.descriptionForm.get('height')?.value;
      this.newDimensions.newCanvasWidth = this.descriptionForm.get('canvasWidth')?.value;
      this.newDimensions.newCanvasHeight = this.descriptionForm.get('canvasHeight')?.value;
      if(this.newDimensions.newWidth != this.icon.width || this.newDimensions.newHeight != this.icon.height) {
        this.newDimensions.rescaled = true;
      }
      if(this.newDimensions.newCanvasWidth != this.icon.width *20 || this.newDimensions.newCanvasHeight != this.icon.height *20) {
        this.newDimensions.resized = true;
      }
      this.dialogRef.close(this.newDimensions);
		} else {
      this.resetForm(this.descriptionForm);
      alert('Invalid data!');
			return;
		}
   }

}
