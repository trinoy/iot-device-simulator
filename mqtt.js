const mqtt = require('mqtt')
const fs = require("fs");
const tls = require('tls');

const timeout = ms => new Promise(res => setTimeout(res, ms))

// Leornardo IoT connection
const HOST_ADDRESS = "7b8e0451-c539-4dbc-8870-1f8ed65ba095.eu10.cp.iot.sap"; // Replace with your IoT Service instance
// device
const DEVICE_ALTERNATE_ID = "bagger1";
const SENSOR_ALTERNATE_ID = "root";
const CAPABILITY_ALTERNATE_ID = "smart_bagger_packing_spec_ack";

// paste the certificates and password in the certs-iot folder before starting the app
const CERTIFICATE_FILE = "./certs-iot/certificate-device1.pem";
const PASSPHRASE_FILE = "./certs-iot/device1-pass.txt";

var presets = {};
var items = [];
var itemsAck = [];
var ack = {};
var mqttClient;

// method to send data to IoT services
const sendDataViaMQTT = function (payload, mqttClient) {
    var topicName = 'measures/' + DEVICE_ALTERNATE_ID;
    var payloadStr = JSON.stringify(payload);
    console.log("Sending the payload to ioT service:- " + payloadStr);
    mqttClient.publish(topicName, payloadStr, [], error => {
        if (!error) {
            console.log("Data successfully sent!");
        } else {
            console.log("An unecpected error occurred:", error);
        }
    });
}

// method to setup the connection with IoT services
const connectToMQTT = function () {
    var options = {
        keepalive: 10,
        clientId: DEVICE_ALTERNATE_ID,
        clean: true,
        reconnectPeriod: 2000,
        connectTimeout: 2000,
        cert: fs.readFileSync(CERTIFICATE_FILE),
        key: fs.readFileSync(CERTIFICATE_FILE),
        passphrase: fs.readFileSync(PASSPHRASE_FILE).toString(),
        rejectUnauthorized: false
    };
    mqttClient = mqtt.connect(`mqtts://${HOST_ADDRESS}:8883`, options);
    mqttClient.subscribe('ack/' + DEVICE_ALTERNATE_ID);
    mqttClient.subscribe('commands/' + DEVICE_ALTERNATE_ID);
    mqttClient.on('connect', () => console.log("Connection established!"));
    mqttClient.on("error", err => console.log("Unexpected error occurred:", err));
    mqttClient.on('reconnect', () => console.log("Reconnected!"));
    mqttClient.on('close', () => console.log("Disconnected!"));
    mqttClient.on('message', (topic, msg) => getCommandAck(topic, msg));
    return mqttClient;
};

const getPresets = function () {
    return presets;
};

const getAck = function () {
    return ack;
};

const deleteAll = function(){
    presets = {};
    items = [];
    itemsAck = [];
    ack = {};
};

// call method to listen to IOT queues where we will get the commands and Ack.
function getCommandAck(topic, msg) {
    console.log("Received message from topic:", topic.toString(), msg.toString());
    if (topic.toString() == "commands/bagger1") {
        var obj = JSON.parse(msg.toString());
        var payload = parsePayload(obj);
        if(payload !=null){
            console.log("Added cmd item to command list");
            var specId = payload.packing_spec_id;
            items.push(obj);
            presets = {};
            presets.items = items;
            sendMachineAckBack(specId,"Success");
        }
        else{
            console.log("Skip cmd item from command list as there is erro");
            sendMachineAckBack("Not Available","Error");
        }
    }
    else{
        console.log("Added Ack item to ack list");
        var obj = JSON.parse(msg.toString());
        itemsAck.push(obj);
        ack = {};
        ack.items = itemsAck;
    }
}

function parsePayload(jsonObj) {
    try {
        var decodedString = new Buffer(jsonObj.command.payload, 'base64').toString('ascii');
        return JSON.parse(decodedString);
    } catch (e) {
        return null;
    }
    return null;
}

function sendMachineAckBack(specId, status) {
    var lastData = {
        machine_id: "bagger1",
        packing_spec_id: specId,
        status: status
    };
    var payload = {
        sensorAlternateId: SENSOR_ALTERNATE_ID,
        capabilityAlternateId: "4cdbf5b8-b238-4f78-ad04-cce98fc68f85",
        measures: [
            lastData.machine_id, lastData.packing_spec_id, lastData.status
        ]
    };
    sendDataViaMQTT(payload,mqttClient);
}

module.exports = {
    connectToMQTT,
    getPresets,
    getAck,
    sendDataViaMQTT,
    deleteAll
};