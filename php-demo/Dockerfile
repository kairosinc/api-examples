FROM kairos/nginx-php-alpine:latest
MAINTAINER Cole Calistra <cole@kairos.com>

## Copy working files to container
COPY . /tmp

RUN apk update && apk add php5-gd php5-imagick ghostscript ghostscript-fonts php5-exif

## Copy files to correct directories
RUN mkdir -p /var/www/app/php-demo                    && \
    cp -Rf /tmp/* /var/www/app/php-demo/              && \
    cp /tmp/conf/default.conf /etc/nginx/conf.d/      && \
    rm -Rf /var/www/app/conf /var/www/app/Dockerfile  && \
    cp /tmp/scripts/nginx_env.sh  /usr/local/bin/     && \
    chmod +x /usr/local/bin/nginx_env.sh              && \
    rm -Rf /tmp/*                                     && \
    touch /var/log/access.log /var/log/error.log      && \
    touch /var/run/php-fpm.sock                       && \
    touch /var/log/php-fpm.log /var/log/demo.log      && \
    ln -sf /dev/stderr /var/log/php-fpm.log           && \
    ln -sf /dev/stdout /var/log/demo.log              && \
    ln -sf /dev/stdout /var/log/nginx/access.log      && \
    ln -sf /dev/stderr /var/log/nginx/error.log       && \
    sed -i -e "s/memory_limit = 128M/memory_limit = 512M/g" /etc/php5/php.ini && \
    chown -R nginx:nginx /var/log/* /etc/nginx/*      && \
    chown -R nginx:nginx /var/www/* /etc/php5/*       && \
    cd /var/www/app/php-demo && composer update

WORKDIR /var/log
