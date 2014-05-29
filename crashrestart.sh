#!/bin/bash

#####################################################################################
#                                                                                   #
# This script is checking is GSD responding, and incase of crash it's starting it.  #
#                                                                                   #
# To make it fully working add the following line to cron (crontab -e)              #
#                       * * * * * /srv/gsd/crashrestart.sh                          #
#                       (it will start this every minute)                           #
#####################################################################################


response=$(curl --write-out %{http_code} --connect-timeout 5  --silent --output /dev/null http://127.0.0.1:8003)
if ! [ $response -eq 200 ]; then
	cd /srv/gsd/
	screen -d -m npm start
	now=`date`
	# You can comment line below, it will only send you mail if you want to know, when server crashes (and it needs mailutils to work)
	echo "Server starting, maybe after crash.\rRestarted at: \r $now" | mail -s 'GSD restarting' you@yourdomainmail.com
	echo "GSD started!"
exit
fi
echo "ok"
