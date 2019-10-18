import { EventEmitter } from 'events';
import * as usb from 'usb';
import * as usbDetection from 'usb-detection';

const supportedVendors = [
  0xA5F,  // Zebra
  0xBDA,  // Test: Realtek
  0x4F2,  // Test: Standart USB Host Controller
];

export class Manager extends EventEmitter {
  constructor() {
    super();

    // Start monitoring device list for upcoming changes such as attaching/removing.
    usbDetection.startMonitoring();

    // Mirror any changes on usbDetection to Manager.
    usbDetection.on('change', (device) => this.emit('change', device));
  }

  /**
   * List of attached usb devices filtered by supported vendors.
   */
  public get deviceList(): Promise <Device[]> {
    return new Promise((resolve, reject) => {
      usbDetection.find((error, devices) => {
        if (error !== undefined) {
          reject();
        } else {
          resolve(devices.filter((device) => supportedVendors.indexOf(device.vendorId) !== -1));
        }
      });
    });
  }
}

export type Device = usbDetection.Device;
