import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ConfirmationDialogComponent } from '../editor/confirmation-dialog/confirmation-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class DialogService {

  constructor(private dialog: MatDialog) { }

  // confirm(message?: string): Observable<boolean> {
  //   let confirmation: boolean = false;

  //   const dialogRef = this.dialog.open(ConfirmationDialogComponent,{
  //     data:{
  //       message: 'Exit Without Saving Changes?',
  //       buttonText: {
  //         ok: 'Exit',
  //         cancel: 'Cancel'
  //       }
  //     }
  //   });

  //   dialogRef.afterClosed().subscribe((confirmed: boolean) => {
  //     return confirmed;
  //   });
  //   // const confirmation = window.confirm(message || 'Is it OK?');

  //   return of(confirmation);
  // }

  async openDialog(): Promise<boolean> {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data:{
          message: 'Exit Without Saving Changes?',
          buttonText: {
            ok: 'Exit',
            cancel: 'Cancel'
          }
        }
    });
   
    return dialogRef.afterClosed()
      .toPromise() 
      .then(result => {
         //console.log("The dialog was closed " + result);
         // this.sheetIndex = result;
         return Promise.resolve(result); 
      });
   }
}
