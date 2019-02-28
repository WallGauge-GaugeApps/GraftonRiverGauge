var request         = require('request');
var dailyValueUrl   = 'https://waterservices.usgs.gov/nwis/dv/?format=json&sites='
var instantValueUrl = 'https://waterservices.usgs.gov/nwis/iv/?format=json&sites='

/**
 * The rData class pulls River data from the USGS.GOV web site.  
 * There are two general catagories of data, daily and instant.  Daily values are updated once a day usually over night.
 * Instant values are updated several times an hour.  Daily and Instant values apper to be kept in seperate databases at the USGS.Gov site and therfore have unique URLS
 * 
 * @param {string} dailyURL = 'https://waterservices.usgs.gov/nwis/dv/?format=json&sites='
 * @param {string} instantURL = 'https://waterservices.usgs.gov/nwis/iv/?format=json&sites='
 */
class rData{
    constructor(dailyURL = dailyValueUrl, instantURL = instantValueUrl){
        this.dailyValueUrl = dailyURL;
        this.instantValueUrl = instantURL;
    }

    /** Pulls daily values form usgs.gov web site and parses through xml respone to find value based on data site code and data parameter code
     * Value is returned in rtnFunction
     * @param {string} dataSiteCode Data site code for gauge
     * @param {string} dataParCode Data parameter code for value to lookup
     * @param {Function} rtnFunction (eNum, eTxt, val)=>{console.log(val)}) Val is valid if eNum == 0
     */
    getDailyValues(dataSiteCode = "05587450", dataParCode = "00060", rtnFunction = (eNum, eTxt, val)=>{console.log(val)}){
        var errNumber = 1;
        var errTxt = 'ERROR, data not found in XML response for dataSiteCode = ' + dataSiteCode + ', dataParCode = ' + dataParCode + ', in getDailyValues method.';
        var valToReturn = '';
        request(this.dailyValueUrl + dataSiteCode, function (error, response, body) {                            
            if (!error && response.statusCode == 200) {  
                var jsonData = JSON.parse(body);                
                jsonData.value.timeSeries.forEach(function(element){
                   if(element.variable.variableCode[0].value == dataParCode){
                       var x = element.values[0].value[0].value;
                       valToReturn = x.toString();
                       errNumber = 0;
                       errTxt = '';
                   };
                });
            } else {
                errNumber = 2;
                errTxt = 'ERROR in getDailyValues(), may be a network issue or problem with URL\n\t' + error;
            };
            rtnFunction(errNumber, errTxt, valToReturn);
        });
    };

    /** Pulls instant values form usgs.gov web site and parses through xml respone to find value based on data site code and data parameter code
     * Value is returned in rtnFunction
     * @param {string} dataSiteCode Data site code for gauge
     * @param {string} dataParCode Data parameter code for value to lookup
     * @param {Function} rtnFunction (eNum, eTxt, val)=>{console.log(val)}) Val is valid if eNum == 0
     */
    getInstantValues(dataSiteCode = "05587450", dataParCode = "00060", rtnFunction = (eNum, eTxt, val)=>{console.log(val)}){
        var errNumber = 1;
        var errTxt = 'ERROR, data not found in XML response for dataSiteCode = ' + dataSiteCode + ', dataParCode = ' + dataParCode + ', in getDailyValues method.';
        var valToReturn = '';
        request(this.instantValueUrl + dataSiteCode, function (error, response, body) {                            
            if (!error && response.statusCode == 200) {  
                var jsonData = JSON.parse(body);                
                jsonData.value.timeSeries.forEach(function(element){
                   if(element.variable.variableCode[0].value == dataParCode){
                       var x = element.values[0].value[0].value;
                       valToReturn = x.toString();
                       errNumber = 0;
                       errTxt = '';
                   };
                });
            } else {
                errNumber = 2;
                errTxt = 'ERROR in getDailyValues(), may be a network issue or problem with URL\n\t' + error;
            };
            rtnFunction(errNumber, errTxt, valToReturn);
        });
    };
};

module.exports = rData;