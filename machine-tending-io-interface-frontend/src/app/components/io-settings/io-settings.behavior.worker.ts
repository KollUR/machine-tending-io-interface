/// <reference lib="webworker" />
import {
    ApplicationBehaviors,
    ApplicationNode, OptionalPromise,
    registerApplicationBehavior,
    ScriptBuilder
} from '@universal-robots/contribution-api';
import { IoSettingsNode, IoSignalReference } from './io-settings.node';

// Default timeout (seconds) applied to door movements until the user changes it.
const DEFAULT_TIMEOUT_SECONDS = 5;

// Extracts the numeric portion of a signal ID (e.g. "DO5" -> 5), or undefined
// when the signal is unassigned or carries no digits.
const extractSignalNumber = (reference?: IoSignalReference): number | undefined => {
    const match = reference?.signalID?.match(/\d+/);
    return match ? Number(match[0]) : undefined;
};

// factory is required
const createApplicationNode = (): OptionalPromise<IoSettingsNode> => ({
    type: 'sko-inc-machine-tending-io-interface-io-settings',    // type is required
    version: '1.0.0',     // version is required
    parameters: {
        outputs: {},
        inputs: {},
        timeoutSeconds: DEFAULT_TIMEOUT_SECONDS
    }
});

// generatePreamble is optional
const generatePreambleScriptCode = (node: IoSettingsNode): OptionalPromise<ScriptBuilder> => {
    console.log(node.parameters?.outputs?.openDoor);
    const builder = new ScriptBuilder();
    const parameters = node.parameters;
    if (!parameters) {
        return builder;
    }
    // Store only the numeric part of each configured signal ID (e.g. "DO5" -> 5)
    // in a global URScript variable. Unassigned signals are skipped.
    const signalVariables: Array<{ variable: string; reference?: IoSignalReference }> = [
        { variable: 'cnc_openDoor_out', reference: parameters.outputs?.openDoor },
        { variable: 'cnc_closeDoor_out', reference: parameters.outputs?.closeDoor },
        { variable: 'cnc_doorSafetySwitch1_out', reference: parameters.outputs?.doorSafetySwitch1 },
        { variable: 'cnc_doorSafetySwitch2_out', reference: parameters.outputs?.doorSafetySwitch2 },
        { variable: 'cnc_doorIsClosed_in', reference: parameters.inputs?.doorIsClosed },
        { variable: 'cnc_doorIsOpen_in', reference: parameters.inputs?.doorIsOpen },
    ];

    for (const { variable, reference } of signalVariables) {
        const signalNumber = extractSignalNumber(reference);
        if (signalNumber !== undefined) {
            builder.addStatements(`global ${variable} = ${signalNumber}`);
        }
    }
    builder.addStatements(`global cnc_timeout = ${parameters.timeoutSeconds}`);

    builder.addStatements(`def cnc_openDoor():`);
    builder.addStatements(`     local wait_time = 0`);
    if (parameters.inputs?.doorIsClosed.signalID.startsWith('D')) {
    builder.addStatements(`    if get_standard_digital_in(cnc_doorIsClosed_in) == False:`);
    }
    else {
    builder.addStatements(`    if get_configurable_digital_in(cnc_doorIsClosed_in) == False:`);
    }
    builder.addStatements(`        popup("CNC Door is not closed!","CNC Error", error=True)`);
    builder.addStatements(`        textmsg("CNC Error: CNC Door is not closed")`);
    builder.addStatements(`        return False`);
    builder.addStatements(`    end`);

    if (parameters.outputs?.openDoor.signalID.startsWith('D')) {
    builder.addStatements(`    set_standard_digital_out(cnc_openDoor_out, True)`);
    } else { 
    builder.addStatements(`    set_configurable_digital_out(cnc_openDoor_out, True)`);
    }
    if (parameters.inputs?.doorIsOpen.signalID.startsWith('D')) {
    builder.addStatements(`    while (get_standard_digital_in(cnc_doorIsOpen_in) == False):`);
    }
    else {
    builder.addStatements(`    while (get_configurable_digital_in(cnc_doorIsOpen_in) == False):`);
    };
    builder.addStatements(`        sleep(0.1)`);
    builder.addStatements(`        wait_time = wait_time + 0.1`);
    builder.addStatements(`        if wait_time > cnc_timeout:`);
    builder.addStatements(`            popup("CNC Timeout: Door did not open!","CNC Error", error=True)`);
    builder.addStatements(`            textmsg("CNC Error: CNC Timeout: Door did not open!")`);
    builder.addStatements(`            return False`);
    builder.addStatements(`        end`);
    builder.addStatements(`    end`);
    if (parameters.outputs?.openDoor.signalID.startsWith('D')) {
    builder.addStatements(`    set_standard_digital_out(cnc_openDoor_out, False)`);
    } else { 
    builder.addStatements(`    set_configurable_digital_out(cnc_openDoor_out, False)`);
    }
    builder.addStatements(`end`);



    builder.addStatements(`def cnc_closeDoor():`);
    builder.addStatements(`     local wait_time = 0`);
    if (parameters.inputs?.doorIsOpen.signalID.startsWith('D')) {
    builder.addStatements(`    if get_standard_digital_in(cnc_doorIsOpen_in) == False:`);
    }
    else {
    builder.addStatements(`    if get_configurable_digital_in(cnc_doorIsOpen_in) == False:`);
    }
    builder.addStatements(`        popup("CNC Door is not open!","CNC Error", error=True)`);
    builder.addStatements(`        textmsg("CNC Error: CNC Door is not open")`);
    builder.addStatements(`        return False`);
    builder.addStatements(`    end`);

    if (parameters.outputs?.closeDoor.signalID.startsWith('D')) {
    builder.addStatements(`    set_standard_digital_out(cnc_closeDoor_out, True)`);
    } else { 
    builder.addStatements(`    set_configurable_digital_out(cnc_closeDoor_out, True)`);
    }
    if (parameters.inputs?.doorIsClosed.signalID.startsWith('D')) {
    builder.addStatements(`    while (get_standard_digital_in(cnc_doorIsClosed_in) == False):`);
    }
    else {
    builder.addStatements(`    while (get_configurable_digital_in(cnc_doorIsClosed_in) == False):`);
    };
    builder.addStatements(`        sleep(0.1)`);
    builder.addStatements(`        wait_time = wait_time + 0.1`);
    builder.addStatements(`        if wait_time > cnc_timeout:`);
    builder.addStatements(`            popup("CNC Timeout: Door did not close!","CNC Error", error=True)`);
    builder.addStatements(`            textmsg("CNC Error: CNC Timeout: Door did not close!")`);
    builder.addStatements(`            return False`);
    builder.addStatements(`        end`);
    builder.addStatements(`    end`);
    if (parameters.outputs?.closeDoor.signalID.startsWith('D')) {
    builder.addStatements(`    set_standard_digital_out(cnc_closeDoor_out, False)`);
    } else { 
    builder.addStatements(`    set_configurable_digital_out(cnc_closeDoor_out, False)`);
    }
    builder.addStatements(`end`);

    return builder;
};

// upgradeNode is optional
const upgradeApplicationNode
  = (loadedNode: ApplicationNode, defaultNode: IoSettingsNode): IoSettingsNode =>
      defaultNode;

// downgradeNode is optional
const downgradeApplicationNode
  = (loadedNode: ApplicationNode, defaultNode: IoSettingsNode): IoSettingsNode =>
      defaultNode;

const behaviors: ApplicationBehaviors = {
    factory: createApplicationNode,
    generatePreamble: generatePreambleScriptCode,
    upgradeNode: upgradeApplicationNode,
    downgradeNode: downgradeApplicationNode
};

registerApplicationBehavior(behaviors);
