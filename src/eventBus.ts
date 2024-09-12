import mitt, { Emitter } from 'mitt';

type Events = {
  'video-uploaded': void;
  'video-created': void;
  // Aggiungi qui altri eventi se necessario
};

const emitter: Emitter<Events> = mitt<Events>();

export default {
  $on: <K extends keyof Events>(type: K, handler: (event: Events[K]) => void) => emitter.on(type, handler),
  $emit: <K extends keyof Events>(type: K, event?: Events[K]) => emitter.emit(type, event),
  $off: <K extends keyof Events>(type: K, handler?: (event: Events[K]) => void) => emitter.off(type, handler),
};