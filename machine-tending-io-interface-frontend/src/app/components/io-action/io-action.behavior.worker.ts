/// <reference lib="webworker" />
import {
    AdvancedTranslatedProgramLabel,
    InsertionContext,
    OptionalPromise,
    ProgramBehaviors,
    ProgramNode,
    registerProgramBehavior,
    ScriptBuilder,
    ValidationContext,
    ValidationResponse
} from '@universal-robots/contribution-api';
import { IoActionNode } from './io-action.node';

// programNodeLabel is required
const createProgramNodeLabel = (node: IoActionNode): AdvancedTranslatedProgramLabel => {
    const dynamicAction = node.parameters?.doorAction === 'open' ? 'Open Door' : 'Close Door';
    return [
        {
            type: 'primary',
            translationKey: 'program-node-labels.io-action.nodeTitle',
        },
        {
            type: 'secondary',
            translationKey: 'program-node-labels.io-action.subTitle',


            interpolateParams: { dynamicValue: dynamicAction },
        },
    ];
};

// factory is required
const createProgramNode = (): OptionalPromise<IoActionNode> => ({
    type: 'sko-inc-machine-tending-io-interface-io-action',
    version: '1.0.0',
    lockChildren: false,
    allowsChildren: false,
    parameters: {
        doorAction: 'open',
    },
});

// generateCodeBeforeChildren is optional
const generateScriptCodeBefore = (node: IoActionNode): OptionalPromise<ScriptBuilder> => {
    const builder = new ScriptBuilder();
    if (node.parameters?.doorAction === 'open') {
        builder.addStatements(`cnc_openDoor()`);
    } else {
        builder.addStatements(`cnc_closeDoor()`);
    }
    return builder;
};

// generateCodeAfterChildren is optional
const generateScriptCodeAfter = (node: IoActionNode): OptionalPromise<ScriptBuilder> => new ScriptBuilder();

// generateCodePreamble is optional
const generatePreambleScriptCode = (node: IoActionNode): OptionalPromise<ScriptBuilder> => new ScriptBuilder();

// validator is optional
const validate = (node: IoActionNode, validationContext: ValidationContext): OptionalPromise<ValidationResponse> => ({
    isValid: true
});

// allowsChild is optional
const allowChildInsert = (node: ProgramNode, childType: string): OptionalPromise<boolean> => true;

// allowedInContext is optional
const allowedInsert = (insertionContext: InsertionContext): OptionalPromise<boolean> => true;

// upgradeNode is optional
const nodeUpgrade = (loadedNode: ProgramNode): ProgramNode => loadedNode;

const behaviors: ProgramBehaviors = {
    programNodeLabel: createProgramNodeLabel,
    factory: createProgramNode,
    generateCodeBeforeChildren: generateScriptCodeBefore,
    generateCodeAfterChildren: generateScriptCodeAfter,
    generateCodePreamble: generatePreambleScriptCode,
    validator: validate,
    allowsChild: allowChildInsert,
    allowedInContext: allowedInsert,
    upgradeNode: nodeUpgrade
};

registerProgramBehavior(behaviors);
