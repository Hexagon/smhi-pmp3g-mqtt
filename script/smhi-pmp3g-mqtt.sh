#!/bin/sh

deno run --allow-net /smhi-pmp3g-mqtt/smhi-pmp3g.js --host $ST_MQTT_HOST --port $ST_MQTT_PORT --lat $ST_LAT --lon $ST_LON --entity $ST_ENTITY --topic $ST_TOPIC --params $ST_PARAMS >> /tmp/smhi-pmp3g.log 2>&1
