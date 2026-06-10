import { ProgramNode } from '@universal-robots/contribution-api';

export type DoorAction = 'open' | 'close';

export interface IoActionNode extends ProgramNode {
    type: string;
    parameters: {
        doorAction: DoorAction;
    };
    lockChildren?: boolean;
    allowsChildren?: boolean;
}
