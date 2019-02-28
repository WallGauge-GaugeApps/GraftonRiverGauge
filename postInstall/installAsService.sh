#!/bin/bash
# From DOS prompt type (git update-index --chmod=+x installAsService.sh) to make this file executable.
set -e
echo "NPM post install shell that installs this app as service starts now..."
echo "Set irdclient as defalut group for GraftonRiverGauge -> sudo chown :irdclient ../GraftonRiverGauge"
sudo chown :irdclient ../GraftonRiverGauge
echo "Give default group write access to the GraftonRiverGauge directory -> sudo chmod g+w ../GraftonRiverGauge"
sudo chmod g+w ../GraftonRiverGauge
echo "Install D-Bus config file for this service -> sudo cp ./postInstall/dbus.conf /etc/dbus-1/system.d/GraftonRiverGauge.conf"
sudo cp ./postInstall/dbus.conf /etc/dbus-1/system.d/GraftonRiverGauge.conf
echo "Install systemd service file -> sudo cp -n ./postInstall/server.service /etc/systemd/system/GraftonRiverGauge.service"
sudo cp -n ./postInstall/server.service /etc/systemd/system/GraftonRiverGauge.service
echo "Enable the servers to start on reboot -> systemctl enable GraftonRiverGauge.service"
sudo systemctl enable GraftonRiverGauge.service
#echo "Start the service now -> systemctl start GraftonRiverGauge.service"
#sudo systemctl start GraftonRiverGauge.service
echo "NPM Post install shell is complete."
echo "To start this servers please reboot the server. After reboot Type -> journalctl -u GraftonRiverGauge -f <- to see status."