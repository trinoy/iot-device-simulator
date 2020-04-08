# iot-device-simulator
Iot Device Simulator SAP UI5 Node.js App

## Steps to follow

- Copy the certificates and password phrase files in the folder certs-iot. The file path 
constant can be found in the code in file mqtt.js.

    `const CERTIFICATE_FILE = "./certs-iot/certificate-device1.pem`

     `const PASSPHRASE_FILE = "./certs-iot/device1-pass.txt"`

- Start the app `node server.js`. The app will be accessible on http://localhost:8080


## Main files to look at 

- **mqtt.js** - This files has the information about connecting to the IOTs MQTT broker
- **server.js** - This has the API proxy calls to invoke the MQTT api CRUD calls.
- **ui** - This folder contains the UI5 code which invokes the MQTT api through the APIs exposed in server.js



