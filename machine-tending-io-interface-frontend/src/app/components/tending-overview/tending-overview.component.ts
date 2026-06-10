import {ChangeDetectionStrategy, ChangeDetectorRef, Component, input, InputSignal, OnChanges, SimpleChanges} from '@angular/core';
import {
  RobotSettings,
  OperatorScreen,
  OperatorScreenPresenter,
  OperatorScreenPresenterAPI
} from '@universal-robots/contribution-api';


@Component({
  templateUrl: './tending-overview.component.html',
  styleUrls: ['./tending-overview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class TendingOverviewComponent implements OperatorScreenPresenter {


}
