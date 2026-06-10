import { ApplicationNode } from '@universal-robots/contribution-api';

/**
 * Reference to a single boolean robot IO signal, scoped by its source so that
 * the same signalID coming from different sources stays unambiguous.
 */
export interface IoSignalReference {
    groupId: string;
    sourceID: string;
    signalID: string;
}

export interface IoSettingsParameters {
    outputs: {
        openDoor?: IoSignalReference;
        closeDoor?: IoSignalReference;
        doorSafetySwitch1?: IoSignalReference;
        doorSafetySwitch2?: IoSignalReference;
    };
    inputs: {
        doorIsClosed?: IoSignalReference;
        doorIsOpen?: IoSignalReference;
    };
    timeoutSeconds: number;
}

export interface IoSettingsNode extends ApplicationNode {
    type: string;
    version: string;
    parameters: IoSettingsParameters;
}
