# Hue-InfluxDB Sample

## Motivation

This is a simple example showing how you can tap into the IoT data from a set of Phillips Smart Home Lights and load it into InfluxDB for monitoring.


```js

Information from your Phillips HUE Developer Account

var hostname = "<your_host_name";
var username = "<your_user_name>";

```

```js

Define yourInfluxDB host and schema(hue)

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

```
```js

Collect and write new measurements to your InfluxDB schema(hue)

function writeMeasure (obj) {

influx.writePoints([
	{
            measurement: 'lights',
            tags: {name: name, on: on,reachable: reachable},
            fields: {bri, hue, sat, color_x, color_y, ct},
         }
   ])
}
```

## Acknowledgments

* Hat tip to anyone who's code was used
* Inspiration
* etc
