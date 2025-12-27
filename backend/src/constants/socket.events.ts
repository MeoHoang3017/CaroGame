/**
 * Socket.io Event Names
 * @description All socket event names used in the application
 */

export const CLIENT_EVENTS = {
  // Room events
  ROOM_CREATE: "room:create",
  ROOM_JOIN: "room:join",
  ROOM_LEAVE: "room:leave",
  ROOM_START: "room:start",
  
  // Match events
  MATCH_JOIN: "match:join",
  MATCH_LEAVE: "match:leave",
  MATCH_MOVE: "match:move",
  MATCH_END: "match:end",
  
  // General
  CONNECT: "connect",
  DISCONNECT: "disconnect",
  ERROR: "error",
} as const;

export const SERVER_EVENTS = {
  // Room events
  ROOM_CREATED: "room:created",
  ROOM_JOINED: "room:joined",
  ROOM_LEFT: "room:left",
  ROOM_UPDATED: "room:updated",
  ROOM_STARTED: "room:started",
  
  // Match events
  MATCH_JOINED: "match:joined",
  MATCH_LEFT: "match:left",
  MATCH_MOVE_MADE: "match:move:made",
  MATCH_WIN: "match:win",
  MATCH_DRAW: "match:draw",
  MATCH_ENDED: "match:ended",
  MATCH_UPDATED: "match:updated",
  
  // Error events
  ERROR: "error",
} as const;

