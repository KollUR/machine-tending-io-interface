import { DoBootstrap, Injector, NgModule } from '@angular/core';
import { IoSettingsComponent } from './components/io-settings/io-settings.component';
import { IoActionComponent } from './components/io-action/io-action.component';
import { LoadPartComponent } from './components/load-part/load-part.component';
import { UnloadPartComponent } from './components/unload-part/unload-part.component';
import { TendingStatusComponent } from './components/tending-status/tending-status.component';
import { TendingOverviewComponent } from './components/tending-overview/tending-overview.component';

import { UIAngularComponentsModule } from '@universal-robots/ui-angular-components';
import { BrowserModule } from '@angular/platform-browser';
import { createCustomElement } from '@angular/elements';
import { HttpBackend, HttpClientModule } from '@angular/common/http';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import {MultiTranslateHttpLoader} from 'ngx-translate-multi-http-loader';
import { PATH } from '../generated/contribution-constants';
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";

export const httpLoaderFactory = (http: HttpBackend) =>
    new MultiTranslateHttpLoader(http, [
      { prefix: PATH + '/assets/i18n/', suffix: '.json' },
      { prefix: './ui/assets/i18n/', suffix: '.json' },
    ]);

@NgModule({

  declarations: [
      IoSettingsComponent,
      IoActionComponent,
      LoadPartComponent,
      UnloadPartComponent,
      TendingStatusComponent,
      TendingOverviewComponent
],
    imports: [
      BrowserModule,
      BrowserAnimationsModule,
      UIAngularComponentsModule,
      HttpClientModule,
      TranslateModule.forRoot({
        loader: { provide: TranslateLoader, useFactory: httpLoaderFactory, deps: [HttpBackend] },
        useDefaultLang: false,
      })
    ],
    providers: [],
})

export class AppModule implements DoBootstrap {
  constructor(private injector: Injector) {
  }

  ngDoBootstrap() {
    const iosettingsComponent = createCustomElement(IoSettingsComponent, {injector: this.injector});
    customElements.define('sko-inc-machine-tending-io-interface-io-settings', iosettingsComponent);
    const ioactionComponent = createCustomElement(IoActionComponent, {injector: this.injector});
    customElements.define('sko-inc-machine-tending-io-interface-io-action', ioactionComponent);
    const loadpartComponent = createCustomElement(LoadPartComponent, {injector: this.injector});
    customElements.define('sko-inc-machine-tending-io-interface-load-part', loadpartComponent);
    const unloadpartComponent = createCustomElement(UnloadPartComponent, {injector: this.injector});
    customElements.define('sko-inc-machine-tending-io-interface-unload-part', unloadpartComponent);
    const tendingstatusComponent = createCustomElement(TendingStatusComponent, {injector: this.injector});
    customElements.define('sko-inc-machine-tending-io-interface-tending-status', tendingstatusComponent);
    const tendingoverviewComponent = createCustomElement(TendingOverviewComponent, {injector: this.injector});
    customElements.define('sko-inc-machine-tending-io-interface-tending-overview', tendingoverviewComponent);
  }

  // This function is never called, because we don't want to actually use the workers, just tell webpack about them
  registerWorkersWithWebPack() {
    new Worker(new URL('./components/io-settings/io-settings.behavior.worker.ts'
        /* webpackChunkName: "io-settings.worker" */, import.meta.url), {
      name: 'io-settings',
      type: 'module'
    });new Worker(new URL('./components/io-action/io-action.behavior.worker.ts'
        /* webpackChunkName: "io-action.worker" */, import.meta.url), {
      name: 'io-action',
      type: 'module'
    });new Worker(new URL('./components/load-part/load-part.behavior.worker.ts'
        /* webpackChunkName: "load-part.worker" */, import.meta.url), {
      name: 'load-part',
      type: 'module'
    });new Worker(new URL('./components/unload-part/unload-part.behavior.worker.ts'
        /* webpackChunkName: "unload-part.worker" */, import.meta.url), {
      name: 'unload-part',
      type: 'module'
    });new Worker(new URL('./components/tending-status/tending-status.behavior.worker.ts'
        /* webpackChunkName: "tending-status.worker" */, import.meta.url), {
      name: 'tending-status',
      type: 'module'
    });new Worker(new URL('./components/tending-overview/tending-overview.behavior.worker.ts'
        /* webpackChunkName: "tending-overview.worker" */, import.meta.url), {
      name: 'tending-overview',
      type: 'module'
    });
  }
}

