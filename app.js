const AppMan = require('app-manager');
const RData = require('river-data-getter');
const irTransmitter = require('irdtxclass');
const Forecast1Day = require('./secondaryGauges/forecast1DayGauge.json');
const ForecastPeak = require('./secondaryGauges/forecastPeakGauge.json');

overrideConsole();

const myAppMan = new AppMan(__dirname + '/gaugeConfig.json', __dirname + '/modifiedConfig.json');
const fc1Day = new irTransmitter(Forecast1Day.gaugeIrAddress, Forecast1Day.calibrationTable);
const fcPeak = new irTransmitter(ForecastPeak.gaugeIrAddress, ForecastPeak.calibrationTable);
const rData = new (RData);
/*
    There are two timmers, one to fetch data from the internet and the other to send it to a gauge. 
    If you would like to send data to the gauge as soon as you receive it, then only one timer is required.
    To disable the send data timer set the sendDataInterval = 0.  Data will then be sent to the gauge as soon as it is received from the Internet
*/
const getDataInterveral = 10;   // Time in minutes
const sendDataInterval = 0;     // If value = 0 get data will send data based on getDataInterveral setting

var gValue = null;
var rvrChange = 0;
var validData = false;
var fCastHasData = false;
var inAlert = false;
var firstRun = true;

console.log('__________________ App Config follows __________________');
console.dir(myAppMan.config, { depth: null });
console.log('________________________________________________________');


function getRvrData() {
    console.log('Updating data via Internet for dataSiteCode = ' + myAppMan.config.dataSiteCode);
    validData = false;
    rData.getCurrentData([myAppMan.config.dataSiteCode])
        .then(() => {
            console.log('Gauge value for ' + myAppMan.config.dataSiteCode + ' = ' + rData.dataObj.current[myAppMan.config.dataSiteCode]['00065'].value)
            setNewValue(0, '', rData.dataObj.current[myAppMan.config.dataSiteCode]['00065'].value);
        })
        .catch((err) => {
            console.error('Error calling rData.getCurrentData ', err)
            setNewValue(1, 'Error getting river data');
        });
    getForecastData();
};

function getForecastData() {
    console.log('Updating forecast data for ' + ForecastPeak.siteID);
    rData.getForecast(ForecastPeak.siteID)
        .then(() => {
            fCastHasData = true;
            console.log(ForecastPeak.descripition + ' = ' + rData.dataObj.forecast[ForecastPeak.siteID].LongTermHigh);
            fcPeak.sendValue(rData.dataObj.forecast[ForecastPeak.siteID].LongTermHigh);
            rvrChange = Number(rData.dataObj.forecast[ForecastPeak.siteID].Current) - Number(rData.dataObj.forecast[ForecastPeak.siteID].Tomorrow);
            if (Number(rData.dataObj.forecast[ForecastPeak.siteID].Tomorrow) < Number(rData.dataObj.forecast[ForecastPeak.siteID].Current)) rvrChange = rvrChange * -1;
            console.log('The current river level is ' + rData.dataObj.forecast[ForecastPeak.siteID].Current + ', ' + Forecast1Day.descripition + ' = ' + rData.dataObj.forecast[ForecastPeak.siteID].Tomorrow + ' this is a change of ' + rvrChange);
            fc1Day.sendValue(rvrChange);
        })
        .catch((err) => {
            console.error('Error calling rData.getForecastData ', err)
        });
}

function setNewValue(eNum, eTxt, val) {
    if (eNum == 0) {
        gValue = val;
        validData = true;
        if (firstRun == true || sendDataInterval == 0) {
            firstRun = false;
            sendValueToGauge();
        };
    } else {
        validData = false;
        console.log('errNum = ' + eNum);
        console.log('errTxt = ' + eTxt);
        myAppMan.setGaugeStatus('Error updating data. ' + (new Date()).toLocaleTimeString() + ', ' + (new Date()).toLocaleDateString() + ' errTxt: ' + eTxt);
        if (inAlert == false) {
            myAppMan.sendAlert({ [myAppMan.config.descripition]: "1" });
            inAlert = true;
        };
    };
};

function sendValueToGauge() {
    if (validData) {
        let rslt = myAppMan.setGaugeValue(gValue, "', 14 day = " +
            Number(rData.dataObj.forecast[ForecastPeak.siteID].LongTermHigh).toFixed(2) + "', 1 day change = " +
            Number(rvrChange).toFixed(2) + "', " +
            "obs = " + rData.dataObj.current[myAppMan.config.dataSiteCode]['00065'].dateTime
        );

        if (rslt) {
            myAppMan.setGaugeStatus('Okay, ' + (new Date()).toLocaleTimeString() + ', ' + (new Date()).toLocaleDateString());
            if (inAlert == true) {
                myAppMan.sendAlert({ [myAppMan.config.descripition]: "0" });
                inAlert = false;
            };
        } else {
            console.log('Not allowed to send gauge value at this time by AppManager.  Check IOS App for details');
        };
    } else {
        console.log('Error skipping data transmission to gauge as valid data flag is set to false.');
    };
};

var randomStart = getRandomInt(5000, 60000);
var dtaRenwalDelay = getRandomInt(60000, 600000);
console.log('First data call will occur in ' + (randomStart / 1000).toFixed(2) + ' seconds.');
console.log('The data renewal and data tx timmers will start ' + (dtaRenwalDelay / 60000).toFixed(2) + ' minutes after first data call.')
if (sendDataInterval > 0) {
    console.log('After the first data call. An update will be made every ' + getDataInterveral.toFixed(2) + ' minutes.');
    console.log('If data is valid it will be sent to the gauge every ' + sendDataInterval.toFixed(2) + ' minutes.');
} else {
    console.log('After the first data call an update will be made every ' + getDataInterveral.toFixed(2) + ' minutes.');
    console.log('Valid data will be sent to the gauge as soon as it is received. ');
};

setTimeout(() => {
    getRvrData();
}, randomStart);

setTimeout(() => {
    console.log('Get data and tx data timmers starting now.')
    setInterval(() => { getRvrData() }, getDataInterveral * 60 * 1000);
    if (sendDataInterval > 0) { setInterval(() => { sendValueToGauge() }, sendDataInterval * 60 * 1000) };
}, dtaRenwalDelay + randomStart);


function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
};

/** Overrides console.error, console.warn, and console.debug
* By placing <#> in front of the log text it will allow us to filter them with systemd
* For example to just see errors and warnings use journalctl with the -p4 option 
*/
function overrideConsole() {
    const orignalConErr = console.error;
    const orignalConWarn = console.warn;
    const orignalConDebug = console.debug;
    console.error = ((data = '', arg = '') => { orignalConErr('<3>' + data, arg) });
    console.warn = ((data = '', arg = '') => { orignalConWarn('<4>' + data, arg) });
    console.debug = ((data = '', arg = '') => { orignalConDebug('<7>' + data, arg) });
};