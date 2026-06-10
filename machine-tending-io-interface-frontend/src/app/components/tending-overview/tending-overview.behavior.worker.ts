/// <reference lib="webworker" />
import {
  OperatorScreenBehaviors,
  registerOperatorScreenBehavior
} from '@universal-robots/contribution-api';

const behaviors: OperatorScreenBehaviors = {
  factory: () => {
    return {
      type: "sko-inc-machine-tending-io-interface-tending-overview",
      version: "1.0.0",
    };
  },
};

registerOperatorScreenBehavior(behaviors);
