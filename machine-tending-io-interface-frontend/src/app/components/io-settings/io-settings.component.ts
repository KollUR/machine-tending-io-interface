import { TranslateService } from '@ngx-translate/core';
import { first } from 'rxjs/operators';
import { firstValueFrom } from 'rxjs';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import {
    ApplicationPresenterAPI,
    ApplicationPresenter,
    RobotSettings,
    SignalDirectionEnum,
    SignalValueTypeEnum,
} from '@universal-robots/contribution-api';
import { DropdownOption } from '@universal-robots/ui-models';
import { IoSettingsNode, IoSignalReference } from './io-settings.node';

type OutputKey = keyof IoSettingsNode['parameters']['outputs'];
type InputKey = keyof IoSettingsNode['parameters']['inputs'];

interface SignalAssignment<K> {
    key: K;
    labelKey: string;
}

const KEY_SEPARATOR = '::';
const DEFAULT_TIMEOUT_SECONDS = 5;

@Component({
    templateUrl: './io-settings.component.html',
    styleUrls: ['./io-settings.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class IoSettingsComponent implements ApplicationPresenter, OnChanges {
    // applicationAPI is optional
    @Input() applicationAPI: ApplicationPresenterAPI;
    // robotSettings is optional
    @Input() robotSettings: RobotSettings;
    // applicationNode is required
    @Input() applicationNode: IoSettingsNode;

    // Digital output signals the operator can assign the door functions to.
    outputOptions: DropdownOption[] = [];
    // Digital input signals the operator can assign the door state functions to.
    inputOptions: DropdownOption[] = [];

    // Timeout bounds (seconds) for a single door movement.
    readonly timeoutMin = 1;
    readonly timeoutMax = 300;

    readonly outputAssignments: ReadonlyArray<SignalAssignment<OutputKey>> = [
        { key: 'openDoor', labelKey: 'presenter.io-settings.label.open_door' },
        { key: 'closeDoor', labelKey: 'presenter.io-settings.label.close_door' },
        { key: 'doorSafetySwitch1', labelKey: 'presenter.io-settings.label.door_safety_switch_one' },
        { key: 'doorSafetySwitch2', labelKey: 'presenter.io-settings.label.door_safety_switch_two' },
    ];

    readonly inputAssignments: ReadonlyArray<SignalAssignment<InputKey>> = [
        { key: 'doorIsClosed', labelKey: 'presenter.io-settings.label.door_is_closed' },
        { key: 'doorIsOpen', labelKey: 'presenter.io-settings.label.door_is_open' },
    ];

    constructor(
        protected readonly translateService: TranslateService,
        protected readonly cd: ChangeDetectorRef
    ) {
    }

    async ngOnChanges(changes: SimpleChanges): Promise<void> {
        if (changes?.robotSettings) {
            if (!changes?.robotSettings?.currentValue) {
                return;
            }

            if (changes?.robotSettings?.isFirstChange()) {
                if (changes?.robotSettings?.currentValue) {
                    this.translateService.use(changes?.robotSettings?.currentValue?.language);
                }
                this.translateService.setDefaultLang('en');
            }

            this.translateService
                .use(changes?.robotSettings?.currentValue?.language)
                .pipe(first())
                .subscribe(() => {
                    this.cd.detectChanges();
                });
        }

        if (changes?.applicationNode?.currentValue) {
            this.ensureParameters();
        }

        if (changes?.applicationAPI?.currentValue) {
            await this.loadSignalOptions();
        }
    }

    /**
     * Backfills the parameters structure for nodes that were persisted before this
     * schema existed, so the setter methods can safely write into it.
     */
    private ensureParameters(): void {
        if (!this.applicationNode) {
            return;
        }
        const node = this.applicationNode;
        node.parameters ??= { outputs: {}, inputs: {}, timeoutSeconds: DEFAULT_TIMEOUT_SECONDS };
        node.parameters.outputs ??= {};
        node.parameters.inputs ??= {};
        if (typeof node.parameters.timeoutSeconds !== 'number') {
            node.parameters.timeoutSeconds = DEFAULT_TIMEOUT_SECONDS;
        }
    }

    getSelectedOutput(key: OutputKey): string | undefined {
        return this.referenceToKey(this.applicationNode?.parameters?.outputs?.[key]);
    }

    getSelectedInput(key: InputKey): string | undefined {
        return this.referenceToKey(this.applicationNode?.parameters?.inputs?.[key]);
    }

    /** True when this output's signal is also assigned to another output function. */
    isOutputDuplicate(key: OutputKey): boolean {
        const outputs = this.applicationNode?.parameters?.outputs;
        if (!outputs) {
            return false;
        }
        const current = this.referenceToKey(outputs[key]);
        return !!current && this.countMatches(Object.values(outputs), current) > 1;
    }

    /** True when this input's signal is also assigned to another input function. */
    isInputDuplicate(key: InputKey): boolean {
        const inputs = this.applicationNode?.parameters?.inputs;
        if (!inputs) {
            return false;
        }
        const current = this.referenceToKey(inputs[key]);
        return !!current && this.countMatches(Object.values(inputs), current) > 1;
    }

    private countMatches(references: Array<IoSignalReference | undefined>, key: string): number {
        return references.filter((reference) => this.referenceToKey(reference) === key).length;
    }

    setOutput(key: OutputKey, option: unknown): void {
        this.applicationNode.parameters.outputs[key] = this.keyToReference(this.optionValue(option));
        this.saveNode();
    }

    setInput(key: InputKey, option: unknown): void {
        this.applicationNode.parameters.inputs[key] = this.keyToReference(this.optionValue(option));
        this.saveNode();
    }

    setTimeoutSeconds(value: string): void {
        const parsed = Number(value);
        if (Number.isNaN(parsed)) {
            return;
        }
        this.applicationNode.parameters.timeoutSeconds = parsed;
        this.saveNode();
    }

    // call saveNode to save node parameters
    saveNode(): void {
        this.cd.detectChanges();
        this.applicationAPI.applicationNodeService.updateNode(this.applicationNode);
    }

    private async loadSignalOptions(): Promise<void> {
        this.outputOptions = await this.fetchOptions(SignalDirectionEnum.OUT);
        this.inputOptions = await this.fetchOptions(SignalDirectionEnum.IN);
        this.cd.detectChanges();
    }

    private async fetchOptions(direction: SignalDirectionEnum): Promise<DropdownOption[]> {
        if (!this.applicationAPI) {
            return [];
        }
        const filter = { direction, valueType: SignalValueTypeEnum.BOOLEAN };
        const sourcesByGroup = await firstValueFrom(this.applicationAPI.sourceService.sources(filter));
        const options: DropdownOption[] = [];
        for (const [groupId, sources] of Object.entries(sourcesByGroup ?? {})) {
            for (const source of sources) {
                // Only show wired IO signals - no Tool IO, Modbus IO, etc.
                if (source.sourceID !== 'ur-robot-wired-io') {
                    continue;
                }
                const signals = await firstValueFrom(
                    this.applicationAPI.sourceService.sourceSignals(groupId, source.sourceID, filter)
                );
                for (const signal of signals) {
                    options.push({
                        label: signal.name || signal.signalID,
                        value: this.referenceToKey({ groupId, sourceID: source.sourceID, signalID: signal.signalID }),
                    });
                }
            }
        }
        return options;
    }

    private optionValue(option: unknown): string | undefined {
        const value = (option as DropdownOption | undefined)?.value;
        return typeof value === 'string' ? value : undefined;
    }

    private referenceToKey(reference?: IoSignalReference): string | undefined {
        if (!reference) {
            return undefined;
        }
        return [reference.groupId, reference.sourceID, reference.signalID].join(KEY_SEPARATOR);
    }

    private keyToReference(key?: string): IoSignalReference | undefined {
        if (!key) {
            return undefined;
        }
        const [groupId, sourceID, signalID] = key.split(KEY_SEPARATOR);
        if (!groupId || !sourceID || !signalID) {
            return undefined;
        }
        return { groupId, sourceID, signalID };
    }
}
