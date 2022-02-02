import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { FileService } from '../services/file.service';
import { FileNewDialogComponent } from './file-new-dialog/file-new-dialog.component';

@Component({
  selector: 'app-file-new',
  templateUrl: './file-new.component.html',
  styleUrls: ['./file-new.component.css']
})
export class FileNewComponent implements OnInit {

  constructor(private fileService: FileService, private matDialog: MatDialog, private router: Router) { }

  ngOnInit(): void {
  }

  createNewFile(): void {
    this.matDialog.open(FileNewDialogComponent);
  }

}
