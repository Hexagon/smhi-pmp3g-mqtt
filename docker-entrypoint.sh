#!/bin/sh
touch /tmp/smhi-pmp3g.log

echo "Starting smhi-pmp3g-mqtt (initial run)"
/bin/sh /smhi-pmp3g-mqtt/smhi-pmp3g-mqtt.sh

echo "Scheduling smhi-pmp3g-mqtt using crond"
crond -b -l 2 && tail -f /tmp/smhi-pmp3g.log
