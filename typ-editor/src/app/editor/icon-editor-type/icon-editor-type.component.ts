import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { FileService } from 'src/app/services/file.service';
import { GraphicElement } from 'src/TYP_File_lib/TypFile_blocks/GeneralDataBlocks/GraphicElement';

import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';

import { polylineTypes } from 'src/TYP_File_lib/IconTypes/PolylineTypes';
import { polygoneTypes } from 'src/TYP_File_lib/IconTypes/PolygoneTypes';
import { POITypes } from 'src/TYP_File_lib/IconTypes/POITypes';
import { Type } from 'src/TYP_File_lib/IconTypes/Type';

export interface State {
  flag: string;
  name: string;
  population: string;
}

@Component({
  selector: 'app-icon-editor-type',
  templateUrl: './icon-editor-type.component.html',
  styleUrls: ['./icon-editor-type.component.css']
})
export class IconEditorTypeComponent implements OnInit {

  @Input() notifier!: Subject<boolean>;

  @Output() unsavedChangesEvent = new EventEmitter<boolean>();

  sub!: Subscription;
  drawableItem!: GraphicElement;
  typeList: Array<Type>

  itemType: string;
  typeID: string;
  subTypeID: string;

  descriptionForm: FormGroup;

  filteredTypes: Observable<Type[]>

  searchByType: boolean;

  constructor(private fileService: FileService, private Activatedroute: ActivatedRoute, private formBuilder: FormBuilder, private router: Router) { 
    this.itemType = "";
    this.typeID = "";
    this.subTypeID = "";
    this.searchByType = false;

    this.typeList = new Array();

    this.descriptionForm = this.formBuilder.group({
      description: ['', [Validators.required]]
    });

    this.filteredTypes = new Observable();
  }

  ngOnInit(): void {
    this.notifier.subscribe(() =>{this.onFormSubmit()});

    this.sub = this.Activatedroute.paramMap.subscribe(params => { 
      this.itemType = params.get('id') || "";
      this.typeID = params.get('id1') || "";
      this.subTypeID = params.get('id2') || "";

      if(this.itemType && this.typeID && this.subTypeID) {
        switch(this.itemType) {
          case 'polyline':
            this.drawableItem = this.fileService.getPolyline(~~this.typeID, ~~this.subTypeID);
            this.typeList = polylineTypes;
            break;
          case 'polygone':
            this.drawableItem = this.fileService.getPolygone(~~this.typeID, ~~this.subTypeID);
            this.typeList = polygoneTypes;
            break;
          case 'poi':
            this.drawableItem = this.fileService.getPOI(~~this.typeID, ~~this.subTypeID);
            this.typeList = POITypes;
            break;
          default:
            new Error("No item type supplied!");
        }
        let tmp = this.descriptionForm.get('description');
        if( tmp !=null ) {
          this.filteredTypes = tmp.valueChanges.pipe(
            startWith(''),
            map(state => (state ? this._filterTypes(state) : this.typeList.slice())),
          );
        }
      }
   });

   const iconTypeResult = this.typeList.find(x => x.type == this.drawableItem.type) || this.typeList[0];
   const preselectedValue: string = iconTypeResult.description + '|' + iconTypeResult.type;
   this.descriptionForm.setValue({description: preselectedValue});
  }

  setStateOfChanges(changes: boolean): void {
    this.unsavedChangesEvent.emit(changes);
  }

  private _filterTypes(value: string): Type[] {
    const filterValue = value.toLowerCase();

    return this.typeList.filter(state => state.description.toLowerCase().includes(filterValue));
  }

  private _filterTypesByTypeCode(value: string): Type[] {
    return this.typeList.filter(state => state.type.toString().includes(value));
  }

  onFormSubmit() {
    if (this.descriptionForm.valid) { 
      let inputValue: string = this.descriptionForm.get('description')?.value;
      if(!this.fileService.updateItemDescription(inputValue, this.drawableItem, this.typeList, this.itemType)) {
        alert('Invalid data!');
      }
      else {
        this.unsavedChangesEvent.emit(false);
        //this.router.navigate(['']);
      }
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

  changeSearchMethod(): void {
    this.searchByType = !this.searchByType;
    this.switchSearchMethod();
  }

  switchSearchMethod(): void {
    let tmp = this.descriptionForm.get('description');
    if( tmp !=null ) {
      if(this.searchByType) {
        this.filteredTypes = tmp.valueChanges.pipe(
          startWith(''),
          map(state => (state ? this._filterTypesByTypeCode(state) : this.typeList.slice())),
        );
      }
      else {
        this.filteredTypes = tmp.valueChanges.pipe(
          startWith(''),
          map(state => (state ? this._filterTypes(state) : this.typeList.slice())),
        );
      }
    }
  }

  changeState(): void {
    this.unsavedChangesEvent.emit(true);
  }

}
