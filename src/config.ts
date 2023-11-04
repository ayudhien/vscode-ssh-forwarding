'use strict';

export  interface connection {
  name: string,
  user: string,
  host: string,
  port: number,
  localbind: {
    host: string,
    port: number
  },
  remotebind: {
    host: string,
    port: number
  },
  keyfile: string
};

export  interface socksproxy {
  name: string,
  user: string,
  host: string,
  port: number,
  localbind: {
    host: string,
    port: number
  },
  keyfile: string
};