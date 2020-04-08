var express = require('express');
const bodyParser = require('body-parser');

var mqttClient;

const mqtt = require('./mqtt.js');
mqttClient = mqtt.connectToMQTT();

var app = express();
app.use(bodyParser.json())
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
)

//  mount static server to current directory path
app.use(express.static(__dirname));

app.get('/presets', (request, response) => {
    var a = mqtt.getPresets();
    response.json(a);
})

app.get('/ack', (request, response) => {
    var a = mqtt.getAck();
    response.json(a);
})


app.get('/deleteAll', (request, response) => {
    mqtt.deleteAll();
    var res = {};
    res.status = "OK";
    response.json(JSON.stringify(res));
})

app.post('/ack', (request, response) => {
    var res = {};
    res.status = "OK";
    console.log(request.body);
    mqtt.sendDataViaMQTT(request.body,mqttClient);
    response.json(JSON.stringify(res));
})

app.listen(8080);
console.log('listening to port 8080');
