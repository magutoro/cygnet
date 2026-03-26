import type { Profile } from "./profile.js";

export interface Settings {
  enabled: boolean;
  profile: Profile;
}

export interface OverlayDomainState {
  visible: boolean;
  top?: number;
}
