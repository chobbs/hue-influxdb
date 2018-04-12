/**
 * Created by mrstark on 4/11/18.
 */

//var parseJson = require('parse-json');
var fs = require('fs');
var request = require('request');

// Phillips HUE API
var HueApi = require("node-hue-api").HueApi;
var hostname = "<your_host_name";
var username = "<your_user_name>";
var api = new HueApi(hostname, username);

var Influx = require('influx');

// Connect to InfluxDB host with my config details and schema

const influx = new Influx.InfluxDB({
    host: 'localhost',
    database: 'hue_lights',
    schema: [
        {
            measurement: 'lights',
            fields: {
                bri: Influx.FieldType.INTEGER,
                hue: Influx.FieldType.INTEGER,
                sat: Influx.FieldType.INTEGER,
                color_x: Influx.FieldType.INTEGER,
                color_y: Influx.FieldType.INTEGER,
                ct: Influx.FieldType.INTEGER
            },
            tags: [
                'name',
                'on',
                'reachable'
            ]
        }
    ]
})

//Debug-only console print message

var displayResult = function(result) {
    console.log(JSON.stringify(result, null, 2));

};

//  Checking smart lights (1) every min for 10mins.
(function checkLights (i) {
    setTimeout(function () {
        console.log("Checking smart lights --> " + timeStamp());
        hueLights();
        if (--i) {          // If i > 0, keep going
            checkLights(i);       // Call the loop again, and pass it the current value of i
        }
    }, 3000);
})(10);


// Fetch an update from the Phillips Hue Smart Lights

function hueLights() {
    console.log("Fetch updated IoT values...");
    api.lights(function (err, lights) {
        if (err) throw err;

        writeMeasure(lights);
    });
}

//Write all Point-Measures from the IoT

function writeMeasure (obj) {

    for (var i = 0; i < 3; i++) {

        console.log("Writing updated values for: " + obj.lights[i].name);

        var name = obj.lights[i].name;
        var on = obj.lights[i].state.on;
        var reachable = obj.lights[i].state.reachable;

        var hue = obj.lights[i].state.hue;
        var bri = obj.lights[i].state.bri;
        var sat = obj.lights[i].state.sat;
        var color_x = obj.lights[i].state.xy[0];
        var color_y = obj.lights[i].state.xy[1];
        var ct = obj.lights[i].state.ct;

        influx.writePoints([
            {
                measurement: 'lights',
                tags: {name: name, on: on,reachable: reachable},
                fields: {bri, hue, sat, color_x, color_y, ct},
            }
        ])
    }
}

//Simple TS function for debug purposes only. InfluxDB inputs current TS on update.

function timeStamp() {
// Create a date object with the current time
    var now = new Date();

// Create an array with the current month, day and time
    var date = [ now.getMonth() + 1, now.getDate(), now.getFullYear() ];

// Create an array with the current hour, minute and second
    var time = [ now.getHours(), now.getMinutes(), now.getSeconds() ];

// Determine AM or PM suffix based on the hour
    var suffix = ( time[0] < 12 ) ? "AM" : "PM";

// Convert hour from military time
    time[0] = ( time[0] < 12 ) ? time[0] : time[0] - 12;

// If hour is 0, set it to 12
    time[0] = time[0] || 12;

// If seconds and minutes are less than 10, add a zero
    for ( var i = 1; i < 3; i++ ) {
        if ( time[i] < 10 ) {
            time[i] = "0" + time[i];
        }
    }

// Return the formatted string
    return date.join("/") + " " + time.join(":") + " " + suffix;
}
