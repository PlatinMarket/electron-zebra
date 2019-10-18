import { ipcRenderer } from 'electron';
import * as m from 'mithril';
import { Device } from './zebra';

export interface IData {
  selected: number;
  list: Device[];
}

// App's root element.
const root = document.getElementById('app');

// Inform the main process.
ipcRenderer.send('renderer.ready');

ipcRenderer.on('device.list', (event: Electron.IpcRendererEvent, data: IData) => {

  devices.data.selected = data.selected;
  devices.data.list = data.list;

  // Trigger mithril's redraw programmatically.
  m.redraw();

});

const devices = {
  data: {
    selected: null,
    list: [],
  } as IData,
  view: () => {
    return m('ul.devices', devices.data.list.map((device, index) => {
      return m('li.device', {
        key: device.deviceAddress,
        class: index === devices.data.selected ? 'selected' : '',
        onclick: () => {
          ipcRenderer.send('device.set', index);
        },
      }, device.deviceName);
    }));
  },
};

const body = {
  view: () => {
    return m('div.body', [
      m(devices),
    ]);
  },
};

m.mount(root, body);
