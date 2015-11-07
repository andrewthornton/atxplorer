FROM node

RUN npm install -g nodemon@1.3

ADD ./package.json /app/package.json

RUN cd /app; npm install

ADD ./ app/

WORKDIR app/

CMD nodemon bin/www
