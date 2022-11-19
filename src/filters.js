
// Find value at a specific time
function findAt(result, targetDate) {
    for(let row of result) {
        const
            startTime = row.t, 
            endTime = new Date(row.t.getTime()+3600*1000);
        if(startTime <= targetDate && endTime > targetDate)
            return row.v;
    }
}


// Find max price
function findMinMaxAtDate(result, targetDate) {
    let maxTime, maxVal = -Infinity;
    let minTime, minVal = Infinity;
    for(let row of result) {
        const
            startTime = row.t, 
            endTime = new Date(row.t.getTime()+3600*1000);
        if(((startTime <= targetDate && endTime > targetDate) || startTime > targetDate) && targetDate.toLocaleDateString() == startTime.toLocaleDateString()) {
            if (maxVal === undefined || maxVal < row.v ) {
                maxVal = row.v;
                maxTime = row.t;
            }
            if (minVal > row.v ) {
                minVal = row.v;
                minTime = row.t;
            }
        }
    }
    return {
        maxVal: maxVal === -Infinity ? null : maxVal,
        minVal: minVal === Infinity ? null : minVal,
        maxTime: maxTime ? maxTime.toISOString() : "",
        minTime: minTime ? minTime.toISOString() : ""
    };
}

export { findAt, findMinMaxAtDate };