#!/bin/bash
# To make this file executable follow these steps https://stackoverflow.com/questions/21691202/how-to-create-file-execute-mode-permissions-in-git-on-windows
set -e
echo "NPM post install shell that installs this app as service starts now..."
echo "Set irdclient as defalut group for GraftonRiverGauge -> sudo chown :irdclient ../GraftonRiverGauge"
sudo chown :irdclient ../GraftonRiverGauge
echo "Give default group write access to the GraftonRiverGauge directory -> sudo chmod g+w ../GraftonRiverGauge"
sudo chmod g+w ../GraftonRiverGauge
echo "Install D-Bus config file for this service -> sudo cp ./postInstall/GraftonRiverGauge.conf /etc/dbus-1/system.d"
sudo cp ./postInstall/GraftonRiverGauge.conf /etc/dbus-1/system.d
echo "Install systemd service file -> cp -n ./postInstall/GraftonRiverGauge.service /etc/systemd/system"
sudo cp -n ./postInstall/GraftonRiverGauge.service /etc/systemd/system
echo "Enable the servers to start on reboot -> systemctl enable GraftonRiverGauge.service"
sudo systemctl enable GraftonRiverGauge.service
#echo "Start the service now -> systemctl start GraftonRiverGauge.service"
#sudo systemctl start GraftonRiverGauge.service
echo "NPM Post install shell is complete."
echo "To start this servers please reboot the server. After reboot Type -> journalctl -u GraftonRiverGauge -f <- to see status."