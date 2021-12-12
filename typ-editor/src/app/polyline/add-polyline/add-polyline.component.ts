import { Component, OnInit } from '@angular/core';
import { Type } from 'src/TYP_File_lib/IconTypes/Type';
import { polylineTypes } from 'src/TYP_File_lib/IconTypes/PolylineTypes';
import { Observable } from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FileService } from 'src/app/services/file.service';

export interface State {
  flag: string;
  name: string;
  population: string;
}

@Component({
  selector: 'app-add-polyline',
  templateUrl: './add-polyline.component.html',
  styleUrls: ['./add-polyline.component.css']
})

export class AddPolylineComponent implements OnInit {

  typeList: Array<Type>
  filteredTypes: Observable<Type[]>

  descriptionForm: FormGroup;

  constructor(private fileService: FileService, private formBuilder: FormBuilder, private router: Router) { 
    this.typeList = new Array();
    this.filteredTypes = new Observable();

    this.descriptionForm = this.formBuilder.group({
      description: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.typeList = polylineTypes;
    let tmp = this.descriptionForm.get('description');
        if( tmp !=null ) {
          this.filteredTypes = tmp.valueChanges.pipe(
            startWith(''),
            map(state => (state ? this._filterTypes(state) : this.typeList.slice())),
          );
        }
  }

  private _filterTypes(value: string): Type[] {
    const filterValue = value.toLowerCase();

    return this.typeList.filter(state => state.description.toLowerCase().includes(filterValue));
  }

  onFormSubmit() {
    if (this.descriptionForm.valid) { 
      // let inputValue: string = this.descriptionForm.get('description')?.value;
      // if(!this.fileService.updateItemDescription(inputValue, this.drawableItem, this.typeList, this.itemType)) {
      //   alert('Invalid data!');
      // }
      // else {
      //   this.router.navigate(['']);
      // }
    }
    else {
      this.resetForm(this.descriptionForm);
      alert('Invalid data!');
			return;
    }
  } 

  resetForm(form: FormGroup) {
		form.reset();
	}

}
