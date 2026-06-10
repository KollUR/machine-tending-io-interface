import {
  registerSidebarBehavior,
  SidebarItemBehaviors,
} from "@universal-robots/contribution-api";

const behaviors: SidebarItemBehaviors = {
  factory: () => {
    return {
      type: "sko-inc-machine-tending-io-interface-tending-status",
      version: "1.0.0",
    };
  },
};

registerSidebarBehavior(behaviors);
