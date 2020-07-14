from debian:buster-20200607

RUN apt-get update \
    && apt-get install mariadb-server npm bcrypt -y \
    && apt-get install -y curl \
    && rm -rf /var/lib/apt/lists/*

RUN curl -LO "https://nodejs.org/dist/latest/node-v14.5.0-linux-x64.tar.gz" \
    && tar -xzf node-v14.5.0-linux-x64.tar.gz -C /usr/local --strip-components=1 \
    && rm node-v14.5.0-linux-x64.tar.gz

ADD package.json /app/
WORKDIR /app
RUN npm install
ADD . /app/
EXPOSE 3000
RUN chmod +x entrypoint.sh
CMD ./entrypoint.sh