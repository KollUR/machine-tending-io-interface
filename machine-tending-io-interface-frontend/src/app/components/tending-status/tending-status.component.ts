import { ChangeDetectionStrategy, Component, computed, effect, input, InputSignal, OnDestroy, Signal, signal, WritableSignal } from '@angular/core';
import {
  RobotSettings,
  SidebarItemPresenter,
  SidebarPresenterAPI,
  SignalBooleanValue,
  SignalEvent
} from '@universal-robots/contribution-api';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { IoSettingsNode, IoSignalReference } from '../io-settings/io-settings.node';

interface SignalSidebarItemPresenter
  extends Omit<SidebarItemPresenter, "robotSettings" | "presenterAPI"> {
  robotSettings: InputSignal<RobotSettings | undefined>;
  presenterAPI: InputSignal<SidebarPresenterAPI | undefined>;
}

const IO_SETTINGS_TYPE = 'sko-inc-machine-tending-io-interface-io-settings';
const BOOLEAN_SIGNAL_EVENT = 'signal_boolean_value';

interface ConfigRow {
  labelKey: string;
  reference?: IoSignalReference;
}

interface DisplayRow {
  labelKey: string;
  signalID?: string;
  assigned: boolean;
  isHigh: boolean;
}

@Component({
  templateUrl: './tending-status.component.html',
  styleUrls: ['./tending-status.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class TendingStatusComponent implements SignalSidebarItemPresenter, OnDestroy {

  readonly robotSettings = input<RobotSettings | undefined>();
  readonly presenterAPI = input<SidebarPresenterAPI | undefined>();

  // The IO assignments read from the io-settings application node.
  private readonly configRows: WritableSignal<ConfigRow[]> = signal<ConfigRow[]>([]);
  // Live boolean values keyed by `${groupId}::${sourceID}::${signalID}`.
  private readonly signalValues: WritableSignal<Map<string, boolean>> = signal<Map<string, boolean>>(new Map());

  readonly rows: Signal<DisplayRow[]> = computed(() => {
    const values = this.signalValues();
    return this.configRows().map((row) => {
      const reference = row.reference;
      const key = reference ? this.valueKey(reference) : undefined;
      return {
        labelKey: row.labelKey,
        signalID: reference?.signalID,
        assigned: !!reference?.signalID,
        isHigh: key ? values.get(key) === true : false,
      };
    });
  });

  private subscriptions: Subscription[] = [];

  constructor(private readonly translateService: TranslateService) {
    effect(() => {
      const settings = this.robotSettings();
      if (settings?.language) {
        this.translateService.setDefaultLang('en');
        this.translateService.use(settings.language);
      }
    });

    effect(() => {
      const api = this.presenterAPI();
      if (api) {
        void this.initialise(api);
      }
    });
  }

  private async initialise(api: SidebarPresenterAPI): Promise<void> {
    const node = (await api.applicationService.getApplicationNode(IO_SETTINGS_TYPE)) as IoSettingsNode | undefined;
    const outputs = node?.parameters?.outputs ?? {};
    const inputs = node?.parameters?.inputs ?? {};

    const configRows: ConfigRow[] = [
      { labelKey: 'presenter.io-settings.label.open_door', reference: outputs.openDoor },
      { labelKey: 'presenter.io-settings.label.close_door', reference: outputs.closeDoor },
      { labelKey: 'presenter.io-settings.label.door_safety_switch_one', reference: outputs.doorSafetySwitch1 },
      { labelKey: 'presenter.io-settings.label.door_safety_switch_two', reference: outputs.doorSafetySwitch2 },
      { labelKey: 'presenter.io-settings.label.door_is_closed', reference: inputs.doorIsClosed },
      { labelKey: 'presenter.io-settings.label.door_is_open', reference: inputs.doorIsOpen },
    ];
    this.configRows.set(configRows);

    this.subscribeToSources(api, configRows);
  }

  // Subscribe to live updates for every distinct source that has an assigned
  // signal, then track the boolean value of each signal as events arrive.
  private subscribeToSources(api: SidebarPresenterAPI, rows: ConfigRow[]): void {
    this.clearSubscriptions();
    this.signalValues.set(new Map());

    const uniqueSources = new Map<string, { groupId: string; sourceID: string }>();
    for (const row of rows) {
      const reference = row.reference;
      if (reference?.signalID) {
        uniqueSources.set(`${reference.groupId}::${reference.sourceID}`, {
          groupId: reference.groupId,
          sourceID: reference.sourceID,
        });
      }
    }

    for (const { groupId, sourceID } of uniqueSources.values()) {
      const subscription = api.sourceService
        .getSourceUpdates(groupId, sourceID)
        .subscribe((event: SignalEvent) => {
          if (event.type !== BOOLEAN_SIGNAL_EVENT) {
            return;
          }
          const next = new Map(this.signalValues());
          next.set(`${groupId}::${sourceID}::${event.signalID}`, (event as SignalBooleanValue).value);
          this.signalValues.set(next);
        });
      this.subscriptions.push(subscription);
    }
  }

  private valueKey(reference: IoSignalReference): string {
    return `${reference.groupId}::${reference.sourceID}::${reference.signalID}`;
  }

  private clearSubscriptions(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
    this.subscriptions = [];
  }

  ngOnDestroy(): void {
    this.clearSubscriptions();
  }
}
