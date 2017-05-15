#!/bin/bash
## Author: Cole Calistra

if [[ $XDEBUG == "true" ]]; then
    apk --update add php5-xdebug --repository http://nl.alpinelinux.org/alpine/latest-stable/community/
    echo "zend_extension="$(find / -name xdebug.so) >/etc/php5/conf.d/xdebug.ini
    echo "xdebug.remote_enable = on" >> /etc/php5/conf.d/xdebug.ini
    echo "xdebug."${XDEBUG_CONFIG} >> /etc/php5/conf.d/xdebug.ini
    echo "xdebug.remote_port = 9000" >> /etc/php5/conf.d/xdebug.ini
    echo 'xdebug.idekey = "INTELLIJ"' >> /etc/php5/conf.d/xdebug.ini
    echo "xdebug.remote_log = /var/log/xdebug_remote.log" >> /etc/php5/conf.d/xdebug.ini
    touch /var/log/xdebug_remote.log
    chown -R nginx:nginx /var/log/xdebug_remote.log /var/log/*
fi
