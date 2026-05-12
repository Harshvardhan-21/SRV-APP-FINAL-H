// Global session event bus — used to signal SESSION_EXPIRED from client.ts
// to AuthContext without circular imports

type Listener = () => void;
const listeners: Listener[] = [];

export const sessionEvents = {
  onExpired(fn: Listener) {
    listeners.push(fn);
    return () => {
      const i = listeners.indexOf(fn);
      if (i !== -1) listeners.splice(i, 1);
    };
  },
  emitExpired() {
    listeners.forEach(fn => fn());
  },
};
