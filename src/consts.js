// PMP3G parameters
// Source - https://opendata.smhi.se/apidocs/metfcst/parameters.html
const consts = {
    msl: { unit: "hPa", description: "Air pressure", minMax: true},
    t: { unit: "Cel", description: "Air temperature", minMax: true},
    vis: { unit: "km", description: "Horizontal visibility", minMax: true},
    wd: { unit: "degree", description: "Wind direction", minMax: true},
    ws: { unit: "m/s", description: "Wind speed", minMax: true},
    r: { unit: "%", description: "Relative humidity", minMax: true},
    tstm: { unit: "%", description: "Thunder probability", minMax: true},	
    tcc_mean: { unit: "octas", description: "Mean value of total cloud cover", minMax: true},	
    lcc_mean: { unit: "octas", description: "Mean value of low level cloud cover", minMax: true},
    mcc_mean: { unit: "octas", description: "Mean value of medium level cloud cover", minMax: true},
    hcc_mean: { unit: "octas", description: "Mean value of high level cloud cover", minMax: true},
    gust: { unit: "m/s", description: "Wind gust speed", minMax: true},
    pmin: { unit: "mm/h", description: "Minimum precipitation intensity", minMax: true},
    pmax: { unit: "mm/h", description: "Maximum precipitation", minMax: true},
    spp: { unit: "%", description: "Percent of precipitation", minMax: true},
    pcat: { unit: "category", description: "Precipitation category", minMax: true},
    pmean: { unit: "mm/h", description: "Mean precipitation intensity", minMax: true},
    pmedian: { unit: "mm/h", description: "Median precipitation", minMax: true},
    Wsymb2: { unit: "code", description: "Weather symbol", minMax: false}
};

export { consts };