#!/bin/bash 
# Absolute path to this script, e.g. /home/user/bin/foo.sh
SCRIPT=$(readlink -f "$0")
# Absolute path this script is in, thus /home/user/bin
SCRIPTPATH=$(dirname "$SCRIPT")

CONTAINER_NAME="GEEKY_MENU_CLOUD_APP"

DOCKER=`which docker`

LISTEN_PORT=8080

#/usr/bin/docker run -p 3000:${LISTEN_PORT} -e LISTEN_PORT=${LISTEN_PORT} --link GEEKY_MONGO:GEEKY_MONGO -v /home/core/GeekyMenuAdmin/app:/app:rw --name GEEKY_MENU_ADMIN_API geekylab/geeky-menu-admin-api
RUN_COMMAND="${DOCKER} run --rm -p ${LISTEN_PORT}:${LISTEN_PORT} --link GEEKY_MONGO:GEEKY_MONGO -e LISTEN_PORT=${LISTEN_PORT} -v ${SCRIPTPATH}/app:/app:rw --name ${CONTAINER_NAME} geekylab/geeky-menu-admin-api"

$RUN_COMMAND
