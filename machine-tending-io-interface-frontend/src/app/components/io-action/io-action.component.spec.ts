import {ComponentFixture, TestBed} from '@angular/core/testing';
import {io-actionComponent} from "./io-action.component";
import {TranslateLoader, TranslateModule} from "@ngx-translate/core";
import {Observable, of} from "rxjs";

describe('IoActionComponent', () => {
  let fixture: ComponentFixture<IoActionComponent>;
  let component: IoActionComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [IoActionComponent],
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

    fixture = TestBed.createComponent(IoActionComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });
});
