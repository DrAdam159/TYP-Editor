import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EditorComponent } from './editor/editor.component';
import { MainPageComponent } from './main-page/main-page.component';
import { PoiComponent } from './poi/poi.component';
import { PolylineComponent } from './polyline/polyline.component';
import { PolygoneComponent } from './polygone/polygone.component';
import { PolygoneDraworderSortComponent } from './polygone-draworder-sort/polygone-draworder-sort.component';
import { OptionsComponent } from './options/options.component';
import { CanDeactivateGuard } from './guards/can-deactivate.guard';
import { IconDescriptionsComponent } from './icon-descriptions/icon-descriptions.component';

const routes: Routes = [
  {path: '', component: MainPageComponent},
  {path: 'home', component: MainPageComponent},
  {path: 'editor/:id/:id1/:id2/:id3', component: EditorComponent, canDeactivate: [CanDeactivateGuard]},
  {path: 'poi/editor/:id/:id1/:id2/:id3', component: EditorComponent, canDeactivate: [CanDeactivateGuard]},
  {path: 'polyline/editor/:id/:id1/:id2/:id3', component: EditorComponent, canDeactivate: [CanDeactivateGuard]},
  {path: 'polygone/editor/:id/:id1/:id2/:id3', component: EditorComponent, canDeactivate: [CanDeactivateGuard]},
  {path: 'poi', component: PoiComponent},
  {path: 'polyline', component: PolylineComponent},
  {path: 'polygone', component: PolygoneComponent},
  {path: 'draworder', component: PolygoneDraworderSortComponent},
  {path: 'descriptions', component: IconDescriptionsComponent},
  {path: 'options', component: OptionsComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
