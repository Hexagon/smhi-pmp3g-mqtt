import { Client } from 'https://deno.land/x/mqtt@0.1.2/deno/mod.ts';
import { config } from './config.js';
import { logger, logAndExit } from "./logger.js";
import { findAt, findMinMaxAtDate } from "./filters.js";
import { consts } from "./consts.js";

// Some nice constants!
const
    oneHourMs = 3600*1000,
    oneDayMs = oneHourMs*24;

// Start by checking that MQTT service is available
let client;
try {
    // Start timeout timer
    const connectionTimeout = setTimeout(() => { 
        if(connectionTimeout) {
            logger("Connection timed out");
            Deno.exit(1);
        }
    }, config.connectionTimeoutMs);

    // Try to connect
    client = new Client({ url: `mqtt://${config.host}:${config.port}` });
    await client.connect();

    // If we got here, all is good, clear timeout timer
    clearTimeout(connectionTimeout);
} catch (e) {

    // Oh cra...
    logAndExit("failed to connect " + e.toString(), 1);
}

async function publishDevice(name, id, state, type, units) {
    if (type !== "json") {
        logger("publishing " + name + " " + state);
    } else {
        logger("publishing " + name + " [json]");
    }
    let
        stateTopic = config.topic + id + "/state",
        attributesTopic = config.topic + id + "/attributes",
        configTopic = config.topic + id + "/config",
        deviceConfig;
    if (type !== "json") {
        deviceConfig = {
            name: name,
            state_topic: stateTopic,
            unit_of_measurement: units,
            object_id: id
        };
    } else  {
        deviceConfig = {
            name: name,
            state_topic: stateTopic,
            json_attributes_topic: attributesTopic,
            object_id: id
        };
    }
    try {
        await client.publish(configTopic, JSON.stringify(deviceConfig)); 
        if(type=="json") {
            await client.publish(stateTopic, "");
            await client.publish(attributesTopic, state);
        } else {
            await client.publish(stateTopic, state);
        }
        await client.publish(stateTopic, state);
    } catch (e) {
        logger("failed to publish " + e.toString());
        Deno.exit(1)
    }
}

// Fetch the data
let response,
    result;
try {
    response = await fetch(`https://opendata-download-metfcst.smhi.se/api/category/pmp3g/version/2/geotype/point/lon/${config.lon}/lat/${config.lat}/data.json`);
    result = await response.json();
} catch (e) {
    logAndExit("failed to fetch " + e.toString(), 1);
}

const filteredResults = {};
for(const r of config.params) {
    filteredResults[r] = [];
}
for(const t of result.timeSeries) {
    const tFilteredParams = t.parameters.filter(t => config.params.includes(t.name));
    for(const p of tFilteredParams) {
        filteredResults[p.name].push({
            t: new Date(t.validTime),
            n: p.name,
            v: p.values[0],
            u: p.unit
        });
    }
}

// Generate a Date which represents 00:00:01 tomorrow
const dateTomorrow = new Date(new Date().getTime()+oneDayMs);
dateTomorrow.setHours(0);
dateTomorrow.setMinutes(0);
dateTomorrow.setSeconds(1);

for(const param of config.params) {
    
    // Check parameter metadata
    const 
        name = consts[param].description,
        unit = consts[param].unit,
        result = filteredResults[param];
    console.log(result);
    // Find extremes in result set
    let
        extremesToday,
        extremesTomorrow;
    if (consts[param].minMax) {
        extremesToday = findMinMaxAtDate(result, new Date()),
        extremesTomorrow = findMinMaxAtDate(result, dateTomorrow);
    }

    // Convenience function which applies extra costs to the temperature_forecast
    function prepareVal(val) {
        if (val !== null) {
            return val.toString();
        } else {
            return "";
        }
    }

    // Ok, ready to publish

    await publishDevice(name + " in 1 hour", config.entity + "_" + param+ "_1h", prepareVal(findAt(result, new Date(new Date().getTime()+oneHourMs))), param, unit);
    await publishDevice(name + " in 6 hours", config.entity + "_" + param + "_6h", prepareVal(findAt(result, new Date(new Date().getTime()+oneHourMs*6))), param, unit);
    await publishDevice(name + " in 12 hours", config.entity + "_" + param + "_12h", prepareVal(findAt(result, new Date(new Date().getTime()+oneHourMs*12))), param, unit);
    if (consts[param].minMax) {
        await publishDevice("Highest upcomping " + name + "_" + param + " today ", config.entity + "_today_max", prepareVal(extremesToday.maxVal), param, unit);
        await publishDevice("Highest upcomping " + name + "_" + param + " today time", config.entity + "_today_max_time", extremesToday.maxTime, "datetime");
        await publishDevice("Lowest upcomping " + name + "_" + param + " today", config.entity + "_today_min", prepareVal(extremesToday.minVal), param, unit);
        await publishDevice("Lowest upcomping " + name + "_" + param + " today time", config.entity + "_today_min_time", extremesToday.minTime, "datetime");
        await publishDevice("Highest upcomping " + name + "_" + param + " tomorrow", config.entity + "_tomorrow_max", prepareVal(extremesTomorrow.maxVal), param, result[0].unit);
        await publishDevice("Highest upcomping " + name + "_" + param + " tomorrow time", config.entity + "_tomorrow_max_time", extremesTomorrow.maxTime, "datetime");
        await publishDevice("Lowest upcomping " + name + "_" + param + " tomorrow", config.entity + "_tomorrow_min", prepareVal(extremesTomorrow.minVal), param, result[0].unit);
        await publishDevice("Lowest upcomping " + name + "_" + param + " tomorrow time", config.entity + "_tomorrow_min_time", extremesTomorrow.minTime, "datetime");
    }
    await publishDevice(name + " data", config.entity + "_" + param + "_data", JSON.stringify({ history: result.map(r=>{ return {st:r.t,p:r.v};}) }), "json");

}
await client.disconnect();