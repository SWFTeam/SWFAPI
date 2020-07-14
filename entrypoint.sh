#!/bin/bash

#MYSQL set
echo "Starting and importing db";
service mysql start;
mysql -uroot -proot < info/db.sql;
mysql -uroot -proot < tests/sample_data.sql;

echo "Starting SWF API"
npm install bcrypt@latest --save;
npm run start;