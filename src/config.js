
import { parse } from "https://deno.land/std/flags/mod.ts";
import { logger, logAndExit } from "./logger.js";

// Set up defaults
const defaultConfig = {
    host: undefined,
    port: undefined,
    topic: "homeassistant/sensor/",
    entity:"temperature_forecast",
    lat: undefined,
    lon: undefined,
    params: undefined,
    connectionTimeoutMs: 20 * 1000
};

// Parse cli arguments
const config = parse(Deno.args, { default: defaultConfig });

// Validate arguments
if (isNaN(parseInt(config.port, 10))) logAndExit("Invalid value passed to --port", 1);
if (!config.topic.length) logAndExit("Invalid value passed to --topic", 1);
if (!config.entity.length) logAndExit("Invalid value passed to --entity", 1);
if (config.lat && !config.lat.toString().length) logAndExit("Invalid value passed to --lat", 1);
if (config.lon && !config.lon.toString().length) logAndExit("Invalid value passed to --lon", 1);
if (!config.params.length) logAndExit("Invalid value passed to --params", 1);

// Clean arguments
config.topic = config.topic.toLowerCase().trim();
config.entity = config.entity.toLowerCase().trim();
config.lat = config.lat.toString().toUpperCase().trim();
config.lon = config.lon.toString().toUpperCase().trim();
config.params = config.params.split(",").map(p => p.toLowerCase().trim());

// All good!
export { config };