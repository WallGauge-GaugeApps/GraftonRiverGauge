//const sunnyBoyWebBox =  require('sunnyboy-web-box-data-fetcher');
const rvrDta =          require('river-data-fetcher');
const MyAppMan =        require('./MyAppManager.js');

const myAppMan = new MyAppMan();

console.log('__________________ App Config follows __________________');
console.dir(myAppMan.config, {depth: null});
console.log('________________________________________________________');

//var solarData =  new sunnyBoyWebBox(myAppMan.config.webBoxIP);

var siteList = {
    [myAppMan.config.dataSiteCode] : {descripition:[myAppMan.config.descripition]}
};

var gDta = new rvrDta(siteList);

function dataUpdateInstantValues(){
    gDta.updateInstantaneousValues(function(errNum, errTxt, dObj){
        if(errNum == 0){   
            console.log('\nInstant Data Report:');
            /*
            Object.keys(dObj.instant).forEach(function(ele1){
                console.log(dObj.instant[ele1].siteName);
                Object.keys(dObj.instant[ele1].siteData).forEach(function(ele2){
                    var oTime = new Date(dObj.instant[ele1].siteData[ele2].observationTime);
                    console.log('\t'+ ele2 + ':\t' + dObj.instant[ele1].siteData[ele2].value + ' ' +dObj.instant[ele1].siteData[ele2].unitCode + ', ' + oTime.toLocaleTimeString() + ' ' + oTime.toLocaleDateString() + '. \n\t\t' + dObj.instant[ele1].siteData[ele2].valueName);
                })
            }); 
            */
            console.log('dobj.instant follows:');
            console.dir(dObj.instant);
            /*
            if(myAppMan.setGaugeValue(dtaObj.powerNow)){
                myAppMan.setGaugeStatus('Okay, ' + (new Date()).toLocaleTimeString() + ', ' + (new Date()).toLocaleDateString());
            } else {
                console.log('Not allowed to send gaguge value at this time by AppManager.  Check IOS App for details');
            };
            */

        } else {
            console.log('errNum = ' + errNum);
            console.log('errTxt = ' + errTxt);
            validData_InstantValues = false;
        }
    });
}



setTimeout(()  =>{dataUpdateInstantValues();}, 5000);                     // wait 5 seconds and then send gauge values (only ran once)

/*
setInterval(() =>{getRiverLevel();}, 5 * 60 * 1000);            // every 5 minutes 


function getRiverLevel(){

    
    solarData.updateValues(function(errNumber, errTxt, dtaObj){
        if(errNumber == 0){
            console.log('Currently generating ' + dtaObj.powerNow + " " + dtaObj.powerNowUnit);
            console.log("\tToday's total power = " + dtaObj.powerToday + " " + dtaObj.powerTodayUnit);
            console.log('\tTotal all time power generated = '+ dtaObj.powerTotal + " " + dtaObj.powerTotalUnit);
            if(myAppMan.setGaugeValue(dtaObj.powerNow)){
                myAppMan.setGaugeStatus('Okay, ' + (new Date()).toLocaleTimeString() + ', ' + (new Date()).toLocaleDateString());
            } else {
                console.log('Not allowed to send gaguge value at this time by AppManager.  Check IOS App for details');
            };
        } else {
            console.log('Error getting data from Sunnyboy WebBox');
            console.log(errTxt);
            myAppMan.setGaugeStatus('Error getting data from SunnyBoy Webbox at ' + (new Date()).toLocaleTimeString() + ', ' + (new Date()).toLocaleDateString()  + ' -> '+ errTxt);
        };
    });
    
};

myAppMan.on('Update', ()=>{
    console.log('New update event has fired.  Reloading gauge objects...');
    myAppMan.setGaugeStatus('Config updated received. Please wait, may take up to 5 minutes to reload gauge objects. ' + (new Date()).toLocaleTimeString() + ', ' + (new Date()).toLocaleDateString());
    console.log('The webBoxIP = ' + myAppMan.config.webBoxIP);
    //solarData =  new sunnyBoyWebBox(myAppMan.config.webBoxIP);
    getRiverLevel();
});

*/