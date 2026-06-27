export const chatEndpoints = {
  messages: (room: string) => `/rooms/${room}/messages`,
  files: (room: string) => `/rooms/${room}/files`,
  file: (room: string, fileId: string) => `/rooms/${room}/files/${fileId}`,
  webrtcConfig: () => "/webrtc/config",
  callHistory: () => "/calls/history",
  groups: () => "/groups",
  group: (groupId: string) => `/groups/${groupId}`,
  groupAvatar: (groupId: string) => `/groups/${groupId}/avatar`,
  contacts: () => "/contacts",
} as const;
