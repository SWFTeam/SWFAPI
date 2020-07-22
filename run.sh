#!/bin/bash
GREEN='\033[0;32m'
NC='\033[0m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
ORANGE='\033[0;33m'

if [[ $1 -eq "--help" ]]; then 
    echo -e "${YELLOW}Usage:"
    echo -e "sudo ./run.sh [complete|empty] [db_user](default: root) [db_password](default: root)${NC}"
    exit
fi

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
    mysql.server restart &> /dev/null
elif [[ $OSTYPE == "linux-gnu"* ]]; then
    service mysql restart &> /dev/null
fi
echo -e "${GREEN}Done.${NC}"
if [ $# -gt 0 ]; then
    if [ -z $2 ]; then
        DBUSER="root"
        DBPASSWORD="root"
    else
        DBUSER=$2
        DBPASSWORD=$3
    fi
    if [ $1 == "complete" ]; then
        echo -e "${YELLOW}Importing database structure 1 sample data...${NC}"
        mysql -u$DBUSER -p$DBPASSWORD < database/dump.sql
        echo -e "${GREEN}Done${NC}"
    elif [ $1 == "empty" ]; then
        echo -e "${YELLOW}Importing only database structure...${NC}"
        mysql -u$DBUSER -p$DBPASSWORD < database/dump_empty.sql
        echo -e "${GREEN}Done${NC}"
    else
        echo "Invalid parameter"
    fi
    npm install
    npm run dev
    echo -e "${ORANGE}Using username ${DBUSER} with password ${DBPASSWORD}${NC}"
else
    echo "No"
fi