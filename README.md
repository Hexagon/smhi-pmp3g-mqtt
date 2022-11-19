# smhi-pmp3g-mqtt

Docker image which periodically gets hourly forecasts from SMHI, and forwards it to a MQTT broker.

For all available forcasts, see https://opendata.smhi.se/apidocs/metfcst/parameters.html

### Features

*  Built in automation, update forecast every hour
*  Sends future temperatures as separate states (+1 hour, +6 hours, +12 hours)
*  Handles time zone conversion automatically, just supply and receive local time
*  Supports Home Assistant MQTT auto discovery ootb

## Installation

### Installing from Docker Hub

Install from Docker hub using the following command, make sure to change SP_MQTT_HOST/PORT/CURRENCY/AREA/TOPIC/ENTITY/DECIMALS to your own settings.

Please note that smhi-pmp3g-mqtt doesn't support mqtt authentication yet.

With the default/example settings, the image will fetch temperatures every full hour, and forward it to homeassistant/sensor/smhi-pmp3g_*/state, it will also send homeassistant/sensor/smhi-pmp3g_*/config to make mqtt autodiscover the entities correctly.

These sensors are provided for every parameter you request, example for parameter t (temperature)

| Sensor                                       | Type  | Description                           |
|----------------------------------------------|-------|---------------------------------------|
| sensor.<entity>_<parameter>_<descriptor>     | -     | General format                        |
| sensor.smhi_pmp3g_t_1h - temperature in 1 hour   | Float | Temperature for next hour               |
| sensor.smhi_pmp3g_t_6h - temperature in 6 hours  | Float | Temperature 6 hours from now            |
| sensor.smhi_pmp3g_t_12h - temperature in 12 hour | Float | Temperature 6 hours from now            |
| sensor.smhi_pmp3g_t_today_max                   | Float | Highest temperature today               |
| sensor.smhi_pmp3g_t_today_max_time              | ISO8601 date | Datetime when highest temperature occur |
| sensor.smhi_pmp3g_t_today_min                   | Float | Lowest temperature today                |
| sensor.smhi_pmp3g_t_today_min_time              | ISO8601 date | Datetime when lowest temperature occur  |
| sensor.smhi_pmp3g_t_tomorrow_max                | Float | Highest temperature tomorrow            |
| sensor.smhi_pmp3g_t_tomorrow_max_time           | ISO8601 date | Datetime when highest temperature occur |
| sensor.smhi_pmp3g_t_tomorrow_min                | Float | Lowest temperature tomorrow             |
| sensor.smhi_pmp3g_t_tomorrow_min_time           | ISO8601 date | Datetime when lowest temperature occur  |
| sensor.smhi_pmp3g_t_data                        | JSON | Raw data to build a forecast chart  |

These environment variables can be sent to docker

| Variable name | Description                         | Example                |
|---------------|-------------------------------------|------------------------|
| ST_MQTT_HOST  | IP to MQTT broker                   | 192.168.1.4            |
| ST_MQTT_PORT  | Port on MQTT broker                 | 1883                   |
| ST_CURRENCY   | Currency                            | SEK                    |
| ST_LAT        | Latitude                            | 59.222222              |
| ST_LON        | Longitude                           | 18.541209              |
| ST_TOPIC      | Base topic                          | homeassistant/sensors/ |
| ST_ENTITY     | Beginning of sensor names           | smhi_pmp3g             |
| ST_PARAMS     | Requested pmp3g parameters, comma separated | t,r,ws         |

Example command using homeassistant/sensors/ as base topic, which will make HA autodiscover the entities.

```
docker run \
        -d \
        --net=host \
        --restart=always \
        -e ST_MQTT_HOST=192.168.1.4 \
        -e ST_MQTT_PORT=1883 \
        -e ST_LAT=59.222222 \
        -e ST_LON=18.541209 \
        -e ST_TOPIC=homeassistant/sensor/ \
        -e ST_ENTITY=smhi_pmp3g \
        -e ST_PARAMS=t \
        --name="smhi-pmp3g-mqtt" \
        hexagon/smhi-pmp3g-mqtt:latest
```

View logs by running

```
docker logs smhi-pmp3g-mqtt
```

### Manual/Local installation

If you want to build the docker image yourself, clone this repository and run

```docker build . --tag=local-smhi-pmp3g-mqtt```

Then use the command from the installation section, but replace ```hexagon/smhi-pmp3g-mqtt``` with ```local-smhi-pmp3g-mqtt```.

## Upgrading

First stop and remove previous version

```docker stop smhi-pmp3g-mqtt```

```docker rm smhi-pmp3g-mqtt```

Then pull the latest version

```docker pull hexagon/smhi-pmp3g-mqtt:latest```

Then follow the above instruction to re-install from Docker Hub (or manually if you wish).

## Running src/smhi-pmp3gs.js standalone

Use omething like this:

`deno run -A .\src\smhi-pmp3g.js --host=192.168.1.4 --port=1883 --lat=59.222222 --lon 18.541209 --topic=homeassistant/sensor/ --entity smhi_pmp3g --params t,r`