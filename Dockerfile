FROM kairos/nginx-php-alpine:latest
MAINTAINER Cole Calistra <cole@kairos.com>

## Copy working files to container
COPY . /tmp

## Copy files to correct directories
RUN cp -Rf /tmp/* /var/www/app/                       && \
    cp /tmp/conf/default.conf /etc/nginx/conf.d/      && \
    rm -Rf /var/www/app/conf /var/www/app/Dockerfile  && \
    rm -Rf /tmp/*                                     && \
    touch /var/log/access.log /var/log/error.log      && \
    touch /var/run/php-fpm.sock                       && \
    touch /var/log/php-fpm.log /var/log/demo.log      && \
    ln -sf /dev/stderr /var/log/php-fpm.log           && \
    ln -sf /dev/stdout /var/log/demo.log              && \
    ln -sf /dev/stdout /var/log/nginx/access.log      && \
    ln -sf /dev/stderr /var/log/nginx/error.log       && \
    chown -R nginx:nginx /var/log/* /etc/nginx/*      && \
    chown -R nginx:nginx /var/www/*

WORKDIR /var/log
