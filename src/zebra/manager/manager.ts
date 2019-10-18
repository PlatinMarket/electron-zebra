import { EventEmitter } from 'events';
import * as usb from 'usb';
import * as usbDetection from 'usb-detection';

export type Device = usbDetection.Device;
type Endpoint = usb.OutEndpoint;

interface IDevice {
  device: Device;
  endpoint: Endpoint;
}

const supportedVendors = [
  0xA5F,  // Zebra
  0xBDA,  // Test: Realtek
  0x4F2,  // Test: Standart USB Host Controller
];

export class Manager extends EventEmitter {

  private _defaultDevice: IDevice;

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

  public defaultDevice(index: number): Promise<any> {
    return new Promise((resolve, reject) => {
      this.getDevice(index)
        .then((device) => this._defaultDevice = device)
        .then(resolve)
        .catch((reason) => reject(`Can't set the default device.\n${reason}`));
    });
  }

  /**
   * Transfers given data to device.
   *
   * Index can be omitted, in that case request will be directed to default device.
   * @param data Data to be transferred into device.
   * @param index Device index in the attached devices.
   */
  public transfer(data: Buffer, index?: number): Promise<any> {
    return new Promise((resolve, reject) => {
      this.getEndpoint(index).then((endpoint) => {
        endpoint.transfer(data, (error) => {
          if (error !== undefined) {
            throw error;
          } else {
            resolve();
          }
        });
      }).catch(reject);
    });
  }

  /**
   * Get the device.
   * @param index Device index in the attached devices.
   */
  private getDevice(index: number): Promise<IDevice> {
    return new Promise((resolve, reject) => {
      this.deviceList
        .then((devices) => devices.find((_, idx) => idx === index))
        .then((device) => {
          // Access the device via node-usb.
          const _device = usb.findByIds(device.vendorId, device.productId);
          _device.open();

          const _interface = _device.interface(0);
          _interface.claim();

          const _endpoint = _interface.endpoints[1] as usb.OutEndpoint;

          resolve({
            device,
            endpoint: _endpoint,
          });
        })
        .catch((reason) => reject(`Can not get the device.\n${reason}`));
    });
  }

  /**
   * Get the endpoint.
   * @param index Device index in the attached devices.
   */
  private getEndpoint(index?: number): Promise<Endpoint> {
    return new Promise((resolve, reject) => {
      if (index !== undefined) {
        resolve(this.getDevice(index).then((device) => device.endpoint));
      } else {
        reject();
      }
    });
  }

}
