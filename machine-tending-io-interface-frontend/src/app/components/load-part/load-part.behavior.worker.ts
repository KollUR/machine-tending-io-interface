import { registerSmartSkillBehavior, ScriptBuilder, SmartSkillBehaviors } from '@universal-robots/contribution-api';

// Used together with createProgramNode example below.
/*
import { CommentNode, NodeType, SmartSkillInstance, SmartSkillsBehaviorAPI, SmartSkillsData } from '@universal-robots/contribution-api';
*/
const behaviors: SmartSkillBehaviors = {
    // factory is required
    factory: () => {
        return {
            type: 'sko-inc-machine-tending-io-interface-load-part',
            name: 'Load Part',
            parameters: {
            },
        };
    },

    // startExecution is required
    startExecution: (instance) => {
        return new ScriptBuilder();
    },

    // stopExecution is optional
    stopExecution: (instance) => {
        return new ScriptBuilder();
    },

  // This function "createProgramNode" is used by the "Teach mode" feature. Uncomment if this Smart Skill must support Teach mode. Otherwise remove this part.
  // If this function is enabled the following behaviour is activated during Teach mode:
  //  1 When This Smart skill is started, robot data will be recorded at 100 Hz.
  //  2 When this Smart skill is stopped this function will be called with the recorded data as input.
  //  3 Any program node returned from the function will be inserted in the program tree.
  // Parameters:
  //  instance: This Smart skills node containing its parameter data.
  //  data: Data recorded during Smart skill activation.
  // Return: OptionalPromise<ProgramNode>

  /*
  createProgramNode: async(instance: SmartSkillInstance, data: SmartSkillsData[]) => {

    // Do something with the recorded data. E.g. ship it to your own backend that does smoothing.
    if (data.length > 0){
      console.log('Recorded Data List Length: ', data.length)
    }

    // Create a program node to be directly inserted in the program tree (this could be a contributed program node).
    // Adding the builtin comment node to the program tree.
    const api = new SmartSkillsBehaviorAPI(self);
    const myCreatedNode = (await api.builder.createNode(NodeType.COMMENT)) as CommentNode;

    // Configure the newly created node.
    myCreatedNode.parameters.comment = "Recorded " + data.length + " data points"

    return myCreatedNode;
  }
  */
};

registerSmartSkillBehavior(behaviors);
