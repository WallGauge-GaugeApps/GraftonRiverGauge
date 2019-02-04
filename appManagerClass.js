const fs =                  require("fs");
const EventEmitter =        require('events');
const irTransmitter =       require('irdtxclass');
const BLEperipheral =       require("ble-peripheral");
const defaultGaugeConfig =  require("./gaugeConfig.json");

const modifiedConfigFilePath = './modifiedConfig.json';
var modifiedConfigMaster = {};

if (fs.existsSync(modifiedConfigFilePath)){
    modifiedConfigMaster = JSON.parse(fs.readFileSync(modifiedConfigFilePath))
};

var Config = {...defaultGaugeConfig, ...modifiedConfigMaster};
var self;

/**
 * This class provides an interface to the gauge’s factory default configuration settings in gaugeConfig.json as well as the dynamically created modifiedConfig.json file.  
 * The modifiedConfig.json will be created when a user configures their gauge.  Not all gauges will need a modifiedConfig.json file.   
 * Additionally, this class forwards gauge values to the irdTxService when a user calls the setGaugeValue(value) method.  
 * This method in turn uses the irdTxClass to communicate with the irdTxService and the ble-peripheral class to make the gauge value available to an administration device over BLE.  
 * See Readme.md for more usage information.
 */
class appManager extends EventEmitter{
    constructor(){
        super();
        this.config = Config;
        this.status = 'ipl, ' + (new Date()).toLocaleTimeString() + ', ' + (new Date()).toLocaleDateString();
        this.value = 'Not Set Yet';
        this._okToSend = true;
        this.gTx = new irTransmitter(this.config.gaugeIrAddress, this.config.calibrationTable);
        this.bPrl = new BLEperipheral(this.config.dBusName, this.config.uuid, this._bleConfig, false);
        self = this;  

        this.bPrl.on('ConnectionChange', (connected)=>{
            var bleUserName = '';
            if(this.bPrl.client.name == ''){
              bleUserName = this.bPrl.client.devicePath;
            } else {
              bleUserName = this.bPrl.client.name;
            };
            if(connected == true){
              console.log('--> ' + bleUserName + ' has connected to this server at ' + (new Date()).toLocaleTimeString());
              if(this.bPrl.client.paired == false){
                console.log('--> CAUTION: This BLE device is not authenticated.');
              }
            } else {
              console.log('<-- ' + bleUserName + ' has disconnected from this server at ' + (new Date()).toLocaleTimeString());
              if(this.bPrl.areAnyCharacteristicsNotifying() == true){
                console.log('Restarting gatt services to cleanup leftover notifications...')
                this.bPrl.restartGattService();
              };
            };
        });
    };

    _bleConfig(DBus){
        self._bleMasterConfig();
        self.bleMyConfig();
    }

    setGaugeValue(value){
        if(this._okToSend){
            this.gTx.sendValue(value);
        } else {
            this.setGaugeStatus('Warining: Gauge value transmission not allowed during adminstration.')
            return false;
        };
        var logValue = value.toString() + ', ' + (new Date()).toLocaleTimeString() + ', ' + (new Date()).toLocaleDateString();
        this.value = logValue;
        this.gaugeValue.setValue(logValue);

        if(this.gaugeValue.iface.Notifying && this.bPrl.client.connected){
            this.gaugeValue.notify();
        };
        return true;
    };

    setGaugeStatus(statusStr){
        this.status = statusStr;
        this.gaugeStatus.setValue(statusStr);

        if(this.gaugeStatus.iface.Notifying && this.bPrl.client.connected){
            this.gaugeStatus.notify();
        };
    };    

    bleMyConfig(){
        console.log('bleMyConfig not extended, there will not be any unique app characteristics set.  Using defaults only.');
    }

    _bleMasterConfig(){
        this.bPrl.logCharacteristicsIO = true;
        //this.bPrl.logAllDBusMessages = true;
        console.log('Initialize charcteristics...')
        this.appVer =       this.bPrl.Characteristic('001d6a44-2551-4342-83c9-c18a16a3afa5', 'appVer', ["encrypt-read"]);
        this.gaugeStatus =  this.bPrl.Characteristic('002d6a44-2551-4342-83c9-c18a16a3afa5', 'gaugeStatus', ["encrypt-read","notify"]);
        this.gaugeValue =   this.bPrl.Characteristic('003d6a44-2551-4342-83c9-c18a16a3afa5', 'gaugeValue', ["encrypt-read","notify"]);
        this.gaugeCommand = this.bPrl.Characteristic('004d6a44-2551-4342-83c9-c18a16a3afa5', 'gaugeCommand', ["encrypt-read","encrypt-write"]);
        this.gaugeConfig =  this.bPrl.Characteristic('005d6a44-2551-4342-83c9-c18a16a3afa5', 'gaugeConfig', ["encrypt-read"]);
    
        console.log('Registering event handlers...');
        this.gaugeCommand.on('WriteValue', (device, arg1)=>{
            var cmdNum = arg1[0];
            var cmdValue = arg1[1]
            var cmdResult = 'okay';
            console.log(device + ' has sent a new gauge command: number = ' + cmdNum + ', value = ' + cmdValue);
    
            switch (cmdNum) {
                case 0:     //0x00
                    console.log('Sending test battery to gauge...');
                    this.setGaugeStatus('Sending test battery command to gauge. ' + (new Date()).toLocaleTimeString() + ', ' + (new Date()).toLocaleDateString());
                    this.gTx.sendEncodedCmd(this.gTx.encodeCmd(this.gTx._cmdList.Check_Battery_Voltage));
                break;
        
                case 1:     //0x01
                    console.log('Sending gauge reset request ');
                    this.setGaugeStatus('Sending reset command to gauge. ' + (new Date()).toLocaleTimeString() + ', ' + (new Date()).toLocaleDateString());
                    this.gTx.sendEncodedCmd(this.gTx.encodeCmd(this.gTx._cmdList.Reset));
                break;
    
                case 2:     //0x02
                    console.log('Sending gauge Zero Needle request ');
                    this.setGaugeStatus('Sending zero needle command to gauge. ' + (new Date()).toLocaleTimeString() + ', ' + (new Date()).toLocaleDateString());
                    this.gTx.sendEncodedCmd(this.gTx.encodeCmd(this.gTx._cmdList.Zero_Needle));
                break;          
        
                case 15:    //0x0F
                    console.log('Sending Identifify gauge request')
                    this.setGaugeStatus('Sending identifify command to gauge. ' + (new Date()).toLocaleTimeString() + ', ' + (new Date()).toLocaleDateString());
                    this.gTx.sendEncodedCmd(this.gTx.encodeCmd(this.gTx._cmdList.Identifify));
                break;
    
                case 20:    //0x14
                    console.log('Disable normal gauge value TX during adminstration.')
                    this.setGaugeStatus('Disable normal gauge value transmission during adminstration. ' + (new Date()).toLocaleTimeString() + ', ' + (new Date()).toLocaleDateString());
                    this._okToSend = false;
                    this.gTx.sendEncodedCmd(0);
                break;
        
                case 21:    //0x15
                    console.log('Enable normal gauge value TX.')
                    this.setGaugeStatus('Enabling normal gauge value transmission. ' + (new Date()).toLocaleTimeString() + ', ' + (new Date()).toLocaleDateString());
                    this._okToSend = true;
                break;

                case 22:    //0x16
                    console.log('Resetting gauge configuration to default.')
                    if (fs.existsSync(modifiedConfigFilePath)){
                        console.log('Removing custom configuration file' + modifiedConfigFilePath);
                        this.setGaugeStatus('Removing custom configuration file and resetting gauge to default config. ' + (new Date()).toLocaleTimeString() + ', ' + (new Date()).toLocaleDateString());
                        fs.unlinkSync(modifiedConfigFilePath);
                        this.reloadConfig();
                    } else {
                        console.log('Warning: Custom configuration file not found.');
                        cmdResult='Warning: Custom configuration file not found.'
                    };                   
                break;
            
                default:
                    console.log('no case for ' + cmdNum);
                    cmdResult='Warning: no case or action for this command.'
                break;
            };
            this.gaugeCommand.setValue('Last command num = ' + cmdNum + ', result = ' + cmdResult + ', at ' + (new Date()).toLocaleTimeString() + ', ' + (new Date()).toLocaleDateString());
        });   
        
        this.appVer.on('ReadValue', (device) =>{
            console.log(device + ' requesting app version')
            this.appVer.setValue((JSON.parse(fs.readFileSync('package.json'))).version);
        })
        
        console.log('setting default characteristic values...');
        this.gaugeValue.setValue(this.value);
        this.gaugeStatus.setValue(this.status)
        this.gaugeConfig.setValue(JSON.stringify(this.config));
    };

    saveItem(itemsToSaveAsObject){
        console.log('saveItem called with:');
        console.log(itemsToSaveAsObject);
    
        var itemList = Object.keys(itemsToSaveAsObject);
        itemList.forEach((keyName)=>{
            modifiedConfigMaster[keyName] = itemsToSaveAsObject[keyName];
        })
        console.log('Writting file to ' + modifiedConfigFilePath);
        fs.writeFileSync(modifiedConfigFilePath, JSON.stringify(modifiedConfigMaster));
        this.reloadConfig();
    };

    reloadConfig(){
        console.log('config reloading...');
        modifiedConfigMaster = {};
        if (fs.existsSync(modifiedConfigFilePath)){
            modifiedConfigMaster = JSON.parse(fs.readFileSync(modifiedConfigFilePath))
        };
        Config = {...defaultGaugeConfig, ...modifiedConfigMaster}
        this.config = Config;
        this.gaugeConfig.setValue(JSON.stringify(this.config));
        console.log('firing "Update" event...');
        this.emit('Update');
    };
};

module.exports = appManager;
