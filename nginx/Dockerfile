FROM nginx

COPY templates/nginx.conf /etc/nginx/

RUN mkdir -p /etc/nginx/sites-enabled/

ADD sites-available/ /etc/nginx/sites-available/

RUN ln -s /etc/nginx/sites-available/exigo.conf /etc/nginx/sites-enabled/exigo.conf

CMD service nginx start

