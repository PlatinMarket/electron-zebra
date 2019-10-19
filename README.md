# electron-zebra

electron-zebra is a small utility program that can handle print requests via a rest api.

## Table of Contents

- [Build](#Build)
  - [Scripts](#Scripts)
- [Configuration](#Configuration)
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
```
$ yarn dev
```
Use to rebuild modules for electron. This command is automatically called in `postinstall`.
```
$ yarn dev:rebuild
```
Build the installer without publishing to github.
```
$ dist:build
```
Build the installer and publish to github. For this option you need to configurate the `package.json`
```
$ dist:publish
```

## Configuration
Configurate `package.json` for auto update releases.

```
{
  "name": "<APP_NAME>",
  ...
  "repository": {
    "type": "git",
    "url": "<github_repo>"
  },
  "build": {
    "appId": "com.electron.<APP_NAME>",
    "productName": "<APP_DISPLAY_NAME_>",
    ...
    "publish": {
      "provider": "github",
      "token": "<GITHUB_ACCESS_TOKEN_WITH_REPO_PERMISSION>"
    }
  }
}

```

You should consider using `GH_TOKEN` env variable to store github token, otherwise github will revoke the token when it encounters with it in the source code.

## Usage

Get default device index and all the supported devices attached to the server system.

```
REQUEST
METHOD: GET
URL: <ip>:<port>

RESPONSE
BODY: {
  selected: <index> | -1,   // Default handler's index or -1 if not present.
  devices: <Device>[ ... ]  // Device list
}
```

 cURL Example

```sh
$ curl -i -H "Accept: application/json" "ip:port"

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
URL: <ip>:<port>
BODY: {
  printer: <index>  // Index of the device in the device list.
}

RESPONSE
200 OK | 500 Internal Error | 400 Bad Request
```

 cURL Example

 ```sh
$ curl -i -d '{"printer": <index>}' -H "Content-Type: application/json" -X POST <ip>:<port>

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
URL: <ip>:<port>
BODY: {
  data: <string>  // ZPL code.
}

RESPONSE
200 OK | 500 Internal Error | 400 Bad Request
```

cURL Example

 ```sh
$ curl -i -d '{"data": "^XA^CF0,30^FO220,115^FD PRINT REQUEST ^FS^XZ"}' -H "Content-Type: application/json" -X POST <ip>:<port>

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
URL: <ip>:<port>
BODY: {
  printer: <index>
  data: <string>  // ZPL code.
}

RESPONSE
200 OK | 500 Internal Error | 400 Bad Request
```

cURL Example

 ```sh
$ curl -i -d '{"printer": 0, "data": "^XA^CF0,30^FO220,115^FD PRINT REQUEST ^FS^XZ"}' -H "Content-Type: application/json" -X POST <ip>:<port>

> HTTP/1.1 200 OK
> X-Powered-By: Express
> Access-Control-Allow-Origin: *
> Date: Sat, 19 Oct 2019 10:31:06 GMT
> Connection: keep-alive
> Content-Length: 0
```

cURL Concurrent print request example

```sh
$ curl -i -d '{"printer":0, "data": "^XA^CF0,30^FO220,115^FD CONCURRENT PRINT REQUEST 1 ^FS^FO220,155^FD CONCURRENT PRINT REQUEST 1 ^FS^FO220,195^FD CONCURRENT PRINT REQUEST 1 ^FS^XZ"}' -H "Content-Type: application/json" -X POST http://localhost:9669 & curl -i -d '{"data": "^XA^CF0,30^FO220,115^FD CONCURRENT PRINT REQUEST 2 ^FS^FO220,155^FD CONCURRENT PRINT REQUEST 2 ^FS^FO220,195^FD CONCURRENT PRINT REQUEST 2 ^FS^XZ"}' -H "Content-Type: application/json" -X POST http://localhost:9669

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
