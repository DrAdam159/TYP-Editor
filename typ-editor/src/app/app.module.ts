import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FileUploadComponent } from './file-upload/file-upload.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import {MatIconModule} from '@angular/material/icon';
import {MatTabsModule} from '@angular/material/tabs';
import {MatTreeModule} from '@angular/material/tree';
import {MatListModule} from '@angular/material/list';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatButtonModule} from '@angular/material/button';
import {MatDialogModule} from '@angular/material/dialog';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatTableModule} from '@angular/material/table';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatMenuModule} from '@angular/material/menu';
import {MatSliderModule} from '@angular/material/slider';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatRadioModule} from '@angular/material/radio';
import {MatBadgeModule} from '@angular/material/badge';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatCardModule} from '@angular/material/card';

import { PolylineComponent } from './polyline/polyline.component';
import { MainPageComponent } from './main-page/main-page.component';
import { PoiComponent } from './poi/poi.component';
import { PolygoneComponent } from './polygone/polygone.component';
import { EditorComponent } from './editor/editor.component';
import { MainNavComponent } from './main-nav/main-nav.component';
import { LayoutModule } from '@angular/cdk/layout';
import { BitmapCanvasComponent } from './bitmap-canvas/bitmap-canvas.component';
import { FileDownloadComponent } from './file-download/file-download.component';

import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';

import { FlexLayoutModule } from '@angular/flex-layout';


//import { MaterialExtensionsModule, MaterialExtensionsExperimentalModule } from '@ng-matero/extensions';
import { MtxColorpickerModule } from '@ng-matero/extensions/colorpicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { IconEditorComponent } from './editor/icon-editor/icon-editor.component';
import { IconEditorDescriptionComponent } from './editor/icon-editor-description/icon-editor-description.component';
import { IconEditorDescriptionFormComponent } from './editor/icon-editor-description/icon-editor-description-form/icon-editor-description-form.component';
import { IconEditorTypeComponent } from './editor/icon-editor-type/icon-editor-type.component';
import { NavComponent } from './nav/nav.component';
import { PolygoneDraworderSortComponent } from './polygone-draworder-sort/polygone-draworder-sort.component';
import { AddPolylineComponent } from './polyline/add-polyline/add-polyline.component';
import { AddPolygoneComponent } from './polygone/add-polygone/add-polygone.component';
import { AddPoiComponent } from './poi/add-poi/add-poi.component';
import { GridSelectComponent } from './grid-select/grid-select.component';
import { NgChartsModule } from 'ng2-charts';
import { OptionsComponent } from './options/options.component';
import { ResizeComponent } from './editor/icon-editor/resize/resize.component';
import { ResizePolylineComponent } from './editor/icon-editor/resize-polyline/resize-polyline.component';
import { FileNewComponent } from './file-new/file-new.component';
import { FileNewDialogComponent } from './file-new/file-new-dialog/file-new-dialog.component';
import { ConfirmationDialogComponent } from './editor/confirmation-dialog/confirmation-dialog.component';
import { SelectTextureComponent } from './editor/icon-editor/select-texture/select-texture.component';
import { SelectColorFilterComponent } from './editor/icon-editor/select-color-filter/select-color-filter.component';


@NgModule({
  declarations: [
    AppComponent,
    FileUploadComponent,
    PolylineComponent,
    MainPageComponent,
    PoiComponent,
    PolygoneComponent,
    EditorComponent,
    MainNavComponent,
    BitmapCanvasComponent,
    FileDownloadComponent,
    IconEditorComponent,
    IconEditorDescriptionComponent,
    IconEditorDescriptionFormComponent,
    IconEditorTypeComponent,
    NavComponent,
    PolygoneDraworderSortComponent,
    AddPolylineComponent,
    AddPolygoneComponent,
    AddPoiComponent,
    GridSelectComponent,
    OptionsComponent,
    ResizeComponent,
    ResizePolylineComponent,
    FileNewComponent,
    FileNewDialogComponent,
    ConfirmationDialogComponent,
    SelectTextureComponent,
    SelectColorFilterComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatIconModule,
    MatTabsModule,
    MatTreeModule,
    MatListModule,
    MatDialogModule,
    MatButtonModule,
    MatGridListModule,
    MatToolbarModule,
    MatSidenavModule,
    LayoutModule,
    MatButtonToggleModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    /*MaterialExtensionsModule,
    MaterialExtensionsExperimentalModule,*/
    MtxColorpickerModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    MatAutocompleteModule,
    FlexLayoutModule,
    MatTooltipModule,
    MatMenuModule,
    MatSliderModule,
    DragDropModule,
    NgChartsModule,
    MatSlideToggleModule,
    MatExpansionModule,
    MatRadioModule,
    MatBadgeModule,
    MatCheckboxModule,
    MatCardModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
