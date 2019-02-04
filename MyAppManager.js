const AppManager = require("./appManagerClass.js");

class myAppManager extends AppManager{
    /*
    bleMyConfig(){
        console.log('Setting up sbPowerGauge specfic characteristics and config.'); 
        var webBoxIp = this.bPrl.Characteristic('00000010-fe9e-4f7b-b56a-5f8294c6d817', 'webBoxIp', ["encrypt-read","encrypt-write"]);

        webBoxIp.on('WriteValue', (device, arg1)=>{
            console.log(device + ', has set new IP Address of ' + arg1);
            webBoxIp.setValue(arg1);
            var x = arg1.toString('utf8');
            this.saveItem({webBoxIP:x});        //this will add {varName : Value} to this.config.  In this case to access the webBoxIP use this.config.webBoxIP
        });

        webBoxIp.on('ReadValue', (device)=>{
            console.log(device + ' has connected and is reading wbBoxIP');
            webBoxIp.setValue(this.config.webBoxIP);
            return (this.config.webBoxIP);
        });

        webBoxIp.setValue(this.config.webBoxIP);
    };
    */
};

module.exports = myAppManager;