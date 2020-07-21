#!/bin/bash
GREEN='\033[0;32m'
NC='\033[0m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
ORANGE='\033[0;33m'

echo -e "${YELLOW}***** SWFAPI Runner 0.1 *****${NC}";

if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}This script must be run as root${NC}" 1>&2
   exit 1
fi

if ! mysql --version COMMAND &> /dev/null
then
    echo -e "${RED}Please install mysql to run API.${NC}"
    exit
fi

if ! node --version COMMAND &> /dev/null
then
    echo -e "${RED}Please install node to run API.${NC}"
    exit
fi

if ! npm --version COMMAND &> /dev/null
then
    echo -e "${RED}Please install npm to run API.${NC}"
    exit
fi

echo -e "${YELLOW}Starting mysql service...${NC}"
if [[ $OSTYPE == "darwin"* ]]; then
    #mysql.server restart &> /dev/null
    echo "WIP"
elif [[ $OSTYPE == "linux-gnu"* ]]; then
    service mysql restart &> /dev/null
fi
echo -e "${GREEN}Done.${NC}"
if [ $# -gt 0 ]; then 
    if [ $1 == "complete" ]; then
        echo -e "${YELLOW} Dumping database structure 1 sample data...${NC}$"
        echo -e "${GREEN} Done${NC}$"
    elif [ $1 == "empty" ]; then
        echo -e "${YELLOW} Dumping database structure...${NC}$"
        echo -e "${GREEN} Done${NC}$"
    else
        echo "Invalid parameter"
    fi
    if [ -z $2 ]; then
        DBUSER="root"
        DBPASSWORD="root"
    else
        DBUSER=$2
        DBPASSWORD=$3
    fi
    npm install
    npm run start
    echo -e "${ORANGE}Using username ${DBUSER} with password ${DBPASSWORD}${NC}"
else
    echo "No"
fi