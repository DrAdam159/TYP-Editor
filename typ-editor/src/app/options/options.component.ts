import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatAccordion } from '@angular/material/expansion';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Header } from 'src/TYP_File_lib/TypFile_blocks/Header';
import { FileService } from '../services/file.service';

@Component({
  selector: 'app-options',
  templateUrl: './options.component.html',
  styleUrls: ['./options.component.css']
})
export class OptionsComponent implements OnInit {

  @ViewChild(MatAccordion) accordion!: MatAccordion;

  options: FormGroup;
  colorPaletteControl = new FormControl('None');
  fidControl = new FormControl(0);
  pidControl = new FormControl(0);
  panelStates: {palette: boolean, fid: boolean, pid: boolean};

  fileHeader!: Header;

  constructor(fb: FormBuilder, private fileService: FileService, private router: Router, private titleService: Title) { 
    this.titleService.setTitle('Settings');
    this.options = fb.group({
      colorPalette: this.colorPaletteControl,
      fid: this.fidControl,
      pid: this.pidControl
    });
    this.panelStates = {palette: false, fid: false, pid: false};
  }

  ngOnInit(): void {
    this.fileHeader = this.fileService.getHeader();
    this.options.setValue({colorPalette: '-1', fid: this.fileHeader.familyID, pid: this.fileHeader.productCode});
  }

  limitColors(): void {
    console.log(this.options.get('colorPalette')?.value);
  }

  saveChangesToFile(): void {
    this.fileHeader.productCode = this.options.get('pid')?.value;
    this.fileHeader.familyID = this.options.get('fid')?.value;
    console.log(~~this.options.get('colorPalette')?.value);
    this.fileService.limitColorPallete(~~this.options.get('colorPalette')?.value);
    this.fileService.updateFile();
    this.router.navigate(['']);
  }

  switchPalettePanelState(state: boolean): void {
    this.panelStates.palette = state;
  }
  switchFIDPanelState(state: boolean): void {
    this.panelStates.fid = state;
  }
  switchPIDPanelState(state: boolean): void {
    this.panelStates.pid = state;
  }
}
