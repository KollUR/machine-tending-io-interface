import {ComponentFixture, TestBed} from '@angular/core/testing';
import { IoSettingsComponent} from "./IoSettings.component";
import {TranslateLoader, TranslateModule} from "@ngx-translate/core";
import {Observable, of} from "rxjs";

describe('IoSettingsComponent', () => {
  let fixture: ComponentFixture<IoSettingsComponent>;
  let component: IoSettingsComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [IoSettingsComponent],
      imports: [TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader, useValue: {
            getTranslation(): Observable<Record<string, string>> {
              return of({});
            }
          }
        }
      })],
    }).compileComponents();

    fixture = TestBed.createComponent(IoSettingsComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });
});
