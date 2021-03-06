# electron-zebra

electron-zebra is a small utility program that can handle print requests via a rest api.

It serves the API Endpoint at the port __65533__

## Table of Contents
- [Installation](#Installation)
- [Build](#Build)
  - [Scripts](#Scripts)
- [Configuration](#Configuration)
  - [Publishing](#Publishing)
- [Usage](#usage)

## Installation

Get the latest stable release from [here](https://github.com/PlatinMarket/electron-zebra/releases/latest/download/Zebra-setup.exe) and install. 

## Build

In order to build on Windows systems, you have to install `windows-build-tools`

```sh
$ npm install -g --production windows-build-tools
```

```sh
$ git clone https://github.com/PlatinMarket/electron-zebra.git

$ yarn

OR

$ npm install
```

## Scripts

Build and execute the electron app in development mode.
```sh
$ yarn dev
```
Use to rebuild modules for electron. This command is automatically called in `postinstall`.
```sh
$ yarn dev:rebuild
```
Build the installer without publishing to github.
```sh
$ yarn dist:build
```
Build the installer and release it through github. For this option you need to configurate the `package.json`
```sh
$ yarn dist:publish
```

## Configuration
Configurate `package.json` for auto update releases.

```js
{
  "name": "<APP_NAME>",
  ...
  "repository": {
    "type": "git",
    "url": "<REPO_URL>"
  },
  ...
  "build": {
    "appId": "com.electron.<APP_NAME>",
    "productName": "<APP_DISPLAY_NAME>",
    ...
    "publish": {
      "provider": "github",
    }
  }
}

```

## Publishing

### Automated Publishing using dist:publish

1. Create a public GitHub repo for your project. And change the `repository.url` in the `package.json` with your repo URL.
2. Create a new personal access token with the repo scope [__from here__](https://github.com/settings/tokens/new).
3. Set `GH_TOKEN` environment variable with the token you've generated.
4. You're ready to publish.

```sh
$ yarn dist:publish
```

Alternatively you can also define the `GH_TOKEN` just for the current shell session like the example below.

```sh
$ export GH_TOKEN='########################################'
$ yarn dist:publish
```

### Manual Publishing

You can also publish the generated files through github release manually.

1. __Build__ your app with `yarn dist:build`.
2. Go to GitHub __Releases__ in your repo.
3. __Draft a new release__.
   1. Enter __Tag Name__. ex. __v1.0.x__ (1.0.x builded app version)
   2. Enter __Release Title__.
   3. Enter __Description__.
   4. Upload the generated files in the __./distribution__
      1. Upload __latest.yml__.
      2. Upload __APPNAME-setup.exe__.
      3. Upload __APPNAME-setup.exe.blockmap__.
4. __Publish Release__.

## Usage

Get the default device's index and all the supported devices attached to the server system.

```
REQUEST
METHOD: GET
URL: <ip>:65533

RESPONSE
BODY: {
  selected: <index> | -1,   // Default handler's index or -1 if not present.
  devices: <Device>[ ... ]  // Device list
}
```

 cURL Example

```sh
$ curl -i -H "Accept: application/json" <ip>:65533

> HTTP/1.1 200 OK
> X-Powered-By: Express
> Access-Control-Allow-Origin: *
> Content-Type: application/json; charset=utf-8
> Content-Length: 180
> ETag: W/"b4-NbSK2aHRpR5gJagyYDFOO681tRY"
> Date: Sat, 19 Oct 2019 10:09:27 GMT
> Connection: keep-alive

> {
  "selected": -1,
  "devices": [
    {
      "locationId": 0,
      "vendorId": 2655,
      "productId": 211,
      "deviceName": "ZTC GC420t (EPL)",
      "manufacturer": "Zebra",
      "serialNumber": "54J154102172",
      "deviceAddress": 14
    }
  ]
}

```

Set the default device to handle print requests that sent without a target device.

```
REQUEST
METHOD: POST
URL: <ip>:65533
HEADERS:
  Content-type: "x-application/zpl"
  x-default-printer: <index>

RESPONSE
200 OK | 500 Internal Error | 400 Bad Request
```

 cURL Example

 ```sh
curl -i -H "Content-Type: x-application/zpl" -H "x-default-printer: 0" -X POST <ip>:65533

> HTTP/1.1 200 OK
> X-Powered-By: Express
> Access-Control-Allow-Origin: *
> Content-Type: text/html; charset=utf-8
> Content-Length: 32
> ETag: W/"20-ruIGTBxF9UD8IqO8YTC8bpDmrQo"
> Date: Sat, 19 Oct 2019 10:30:12 GMT
> Connection: keep-alive

> "Default printer succesfully set."
```

Send print request to the default device.

```
REQUEST
METHOD: POST
URL: <ip>:65533
HEADERS:
  Content-type: "x-application/zpl"
BODY:
  <zpl code>

RESPONSE
200 OK | 500 Internal Error | 400 Bad Request
```

cURL Example

 ```sh
$ curl -i -H "Content-Type: x-application/zpl" --data "^XA^CF0,30^FO220,115^FD PRINT REQUEST ^FS^XZ" -X POST <ip>:65533

> HTTP/1.1 200 OK
> X-Powered-By: Express
> Access-Control-Allow-Origin: *
> Date: Sat, 19 Oct 2019 10:31:06 GMT
> Connection: keep-alive
> Content-Length: 0
```

Send print request to targeted device.

```
REQUEST
METHOD: POST
URL: <ip>:65533
HEADERS:
  Content-type: "x-application/zpl"
  x-printer: <index>
BODY:
  <zpl code>

RESPONSE
200 OK | 500 Internal Error | 400 Bad Request
```

cURL Example

 ```sh
$ curl -i -H "Content-Type: x-application/zpl" -H "x-printer: 0" --data "^XA^CF0,30^FO220,115^FD PRINT REQUEST ^FS^XZ" -X POST <ip>:65533

> HTTP/1.1 200 OK
> X-Powered-By: Express
> Access-Control-Allow-Origin: *
> Date: Sat, 19 Oct 2019 10:31:06 GMT
> Connection: keep-alive
> Content-Length: 0
```

cURL Example: concurrent print request to the default device and a targeted device.

```sh
$ curl -i -H "Content-Type: x-application/zpl" -H "x-printer: 0" --data "^XA^CF0,30^FO220,115^FD CONCURRENT PRINT REQUEST 1 ^FS^FO220,155^FD CONCURRENT PRINT REQUEST 1 ^FS^FO220,195^FD CONCURRENT PRINT REQUEST 1 ^FS^XZ" -X POST http://localhost:65533 & curl -i -H "Content-Type: x-application/zpl" --data "^XA^CF0,30^FO220,115^FD CONCURRENT PRINT REQUEST 2 ^FS^FO220,155^FD CONCURRENT PRINT REQUEST 2 ^FS^FO220,195^FD CONCURRENT PRINT REQUEST 2 ^FS^XZ" -X POST http://localhost:65533

> HTTP/1.1 200 OK
> X-Powered-By: Express
> Access-Control-Allow-Origin: *
> Date: Sat, 19 Oct 2019 11:20:31 GMT
> Connection: keep-alive
> Content-Length: 0

> HTTP/1.1 200 OK
> X-Powered-By: Express
> Access-Control-Allow-Origin: *
> Date: Sat, 19 Oct 2019 11:20:31 GMT
> Connection: keep-alive
> Content-Length: 0
```
