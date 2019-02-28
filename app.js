const RvrDta =  require('./riverData.js');
const AppMan =  require('app-manager');

const myAppMan = new AppMan(__dirname + '/gaugeConfig.json', __dirname + '/modifiedConfig.json');
const gDta = new RvrDta();
/*
    There are two timmers, one to fetch data from the internet and the other to send it to a gauge. 
    If you would like to send data to the gauge as soon as you receive it, then only one timer is required.
    To disable the send data timer set the sendDataInterval = 0.  Data will then be sent to the gauge as soon as it is received from the Internet
*/
const getDataInterveral = 10;   // Time in minutes
const sendDataInterval = 0;     // If value = 0 get data will send data based on getDataInterveral setting

var gValue = null;
var validData = false;
var inAlert = false;
var firstRun = true;

console.log('__________________ App Config follows __________________');
console.dir(myAppMan.config, {depth: null});
console.log('________________________________________________________');


function getRvrData(){
    console.log('Updating data via Internet for dataSiteCode = ' + myAppMan.config.dataSiteCode + ', dataParCode = ' + myAppMan.config.dataParCode);
    validData = false;
    gDta.getInstantValues(myAppMan.config.dataSiteCode, myAppMan.config.dataParCode, setNewValue);
};

function setNewValue(eNum, eTxt, val){
    if(eNum==0){
        gValue = val;
        validData = true;
        if(firstRun == true || sendDataInterval == 0){
            firstRun = false;
            sendValueToGauge();
        };
    } else {
        validData = false;
        console.log('errNum = ' + eNum);
        console.log('errTxt = ' + eTxt);
        myAppMan.setGaugeStatus('Error updating data. ' + (new Date()).toLocaleTimeString() + ', ' + (new Date()).toLocaleDateString() + ' errTxt: ' + eTxt);
        if(inAlert == false){
            myAppMan.sendAlert({[myAppMan.config.descripition]:"1"});
            inAlert = true;
        };
    };
};

function sendValueToGauge(){
    if(validData){
        if(myAppMan.setGaugeValue(gValue)){
            myAppMan.setGaugeStatus('Okay, ' + (new Date()).toLocaleTimeString() + ', ' + (new Date()).toLocaleDateString());
            if(inAlert == true){
                myAppMan.sendAlert({[myAppMan.config.descripition]:"0"});
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
console.log('First data call will occur in '+ (randomStart / 1000).toFixed(2) + ' seconds.');
console.log('The data renewal and data tx timmers will start ' + (dtaRenwalDelay / 60000).toFixed(2) + ' minutes after first data call.')
if(sendDataInterval > 0){
    console.log('After the first data call. An update will be made every ' + getDataInterveral.toFixed(2) + ' minutes.');
    console.log('If data is valid it will be sent to the gauge every ' + sendDataInterval.toFixed(2) + ' minutes.');
} else {
    console.log('After the first data call an update will be made every ' + getDataInterveral.toFixed(2) + ' minutes.');
    console.log('Valid data will be sent to the gauge as soon as it is received. ');
};

setTimeout(()  =>{
    getRvrData();
}, randomStart);                     

setTimeout(()=>{
    console.log('Get data and tx data timmers starting now.')
    setInterval(()=>{getRvrData()}, getDataInterveral * 60 * 1000);
    if(sendDataInterval > 0){setInterval(()=>{sendValueToGauge()}, sendDataInterval * 60 * 1000)};
},dtaRenwalDelay + randomStart);


function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
  };