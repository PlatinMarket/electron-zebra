import { EventEmitter } from 'events';
import * as usb from 'usb';
import * as usbDetection from 'usb-detection';

export class Manager extends EventEmitter {
  constructor() {
    super();
  }
}
