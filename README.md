# Grafton River Gauge (Data Delegate)
This Node.JS app reads the real-time river level and sends it to a physical battery powered gauge for display with the [irdTxClass ]( https://github.com/RuckerGauge/irdTxClass).  This application is intended to run on a Raspberry Pi Zero W configured as the Gauge Data Transmitter (see [irdTxServer ]( https://github.com/RuckerGauge/irdTxServer)).   

## Hardware Requirements
1. Raspberry Pi Zero W
1. rGauge.com Gauge Data Transmitter Daughterboard.
## Software Requirements (must be installed before Install)
1. Raspbian Stretch Lite with a build date of November 13, 2018 (newer versions should work but not tested yet)
2. Node.js v10.14. Older versions may work just not been tested. 
3. git
4. Bluez v5.50 [Raspberry Pi Zero W Bluez v5.50 upgrade steps ](https://github.com/RuckerGauge/Raspberry-Pi-Zero-W-Bluez-5.50-upgrade-steps)
5. [irdTxServer ]( https://github.com/RuckerGauge/irdTxServer) installed and running (waiting for gauge data).
6. [rgMan](https://github.com/RuckerGauge/rgMan) installed and running.   

The rgMan app will automatically install this application so the following steps are only necessary if not using rgMan. 

---
## Manual Install Steps
On the Raspberry Pi Zero W from a [SSH session](https://www.raspberrypi.org/magpi/ssh-remote-control-raspberry-pi/):  
* Create a the rgservice system user account (if not already created) by typing `sudo adduser rgservice --system --ingroup irdclient`
* type `cd /opt/rGauge/gList`.  All rGauge apps are installed from this directory.  The directory should already exist if [rgMan](https://github.com/RuckerGauge/rgMan) has been installed correctly.
* type `git clone https://github.com/RuckerGauge/GraftonRiverGauge.git`
  * This will create a new subdirectory and download the latest version of this node.js app.
* type `cd GraftonRiverGauge`
* type `npm install`
  * The npm install process will install the node dependencies. 


## More Gauge pictures:
comming soon
