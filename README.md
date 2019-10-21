# electron-zebra

electron-zebra is a small utility program that can handle print requests via a rest api.

It serves the API Endpoint at the port __65533__

## Table of Contents

- [Build](#Build)
  - [Scripts](#Scripts)
- [Configuration](#Configuration)
  - [Publishing](#Publishing)
- [Usage](#usage)

## Build

In order to build on Windows systems, you have to install `windows-build-tools`

```sh
$ npm install -g --production windows-build-tools
```

```sh
$ git clone https://github.com/anotherglitchinthematrix/electron-zebra

$ yarn

OR

$ npm install
```

## Scripts

Build and execute the electron app in development.
```sh
$ yarn dev
```
Use to rebuild modules for electron. This command is automatically called in `postinstall`.
```sh
$ yarn dev:rebuild
```
Build the installer without publishing to github.
```sh
$ dist:build
```
Build the installer and publish to github. For this option you need to configurate the `package.json`
```sh
$ dist:publish
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
    "productName": "<APP_DISPLAY_NAME_>",
    ...
    "publish": {
      "provider": "github",
    }
  }
}

```

## Publishing


Create a Public GitHub repo for your poject. And change the `repository.url` in the `package.json` with your repo URL.

Create new personal access token with the repo scope [__from here__](https://github.com/settings/tokens/new).

Set `GH_TOKEN` environment variable with the token you've generated.

You're ready to publish.

```sh
$ yarn dist:publish
```

Alternatively you can also define it just for the current shell session like the example below.

```sh
$ export GH_TOKEN='########################################'
$ yarn dist:publish
```

## Usage

Get default device index and all the supported devices attached to the server system.

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

Set a default device to handle print requests that sent without a target.

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

Send print request to default device.

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

cURL Example: concurrent print request example to default device and a targeted device.

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
