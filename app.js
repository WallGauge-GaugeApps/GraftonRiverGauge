const RvrDta =  require('river-data-fetcher');
const AppMan =  require('app-manager');

const myAppMan = new AppMan(__dirname + '/gaugeConfig.json', __dirname + '/modifiedConfig.json');

console.log('__________________ App Config follows __________________');
console.dir(myAppMan.config, {depth: null});
console.log('________________________________________________________');

var siteList = {
    [myAppMan.config.dataSiteCode] : {descripition:[myAppMan.config.descripition]}
};

var gDta = new RvrDta(siteList);

function dataUpdateInstantValues(){
    gDta.updateInstantaneousValues(function(errNum, errTxt, dObj){
        if(errNum == 0){   
            var rvrLevel = dObj[myAppMan.config.dataLoc][myAppMan.config.dataSiteCode].siteData[myAppMan.config.dataParCode].value;
            console.log('River Level = ' + rvrLevel);

            if(myAppMan.setGaugeValue(rvrLevel)){
                myAppMan.setGaugeStatus('Okay, ' + (new Date()).toLocaleTimeString() + ', ' + (new Date()).toLocaleDateString());
            } else {
                console.log('Not allowed to send gauge value at this time by AppManager.  Check IOS App for details');
            };
        } else {
            console.log('errNum = ' + errNum);
            console.log('errTxt = ' + errTxt);
            myAppMan.setGaugeStatus('Error updating data. ' + (new Date()).toLocaleTimeString() + ', ' + (new Date()).toLocaleDateString() + ' errTxt: ' + errTxt);
            validData_InstantValues = false;
        };
    });
};

setTimeout(()  =>{dataUpdateInstantValues();}, 5000);                     // wait 5 seconds and then send gauge values (only ran once)
setInterval(() =>{dataUpdateInstantValues();}, 10 * 60 * 1000);           // every 10 minutes 
