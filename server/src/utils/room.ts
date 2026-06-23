const ROOM_PATTERN = /^[a-zA-Z0-9_-]{1,64}$/;

export function isValidRoom(room: string) {
  return ROOM_PATTERN.test(room);
}
