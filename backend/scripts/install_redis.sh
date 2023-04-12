#!/bin/bash

# Request sudo permissions upfront
if [[ $(id -u) -ne 0 ]]; then
    echo "This script requires sudo privileges. Please enter your password."
    exec sudo "${BASH_SOURCE[0]}" "$@"
fi

#Install Redis only if it's not already installed
if ! command -v redis-server &> /dev/null
then
    curl -fsSL https://packages.redis.io/gpg | sudo gpg --dearmor -o /usr/share/keyrings/redis-archive-keyring.gpg
    echo "deb [signed-by=/usr/share/keyrings/redis-archive-keyring.gpg] https://packages.redis.io/deb $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/redis.list
    sudo apt-get update
    sudo apt-get install redis
else
    echo "Redis is already installed."
fi


REDIS_PASSWORD=$1
if [ -z "$REDIS_PASSWORD" ]
then
    # if no password provided, set a random password
    REDIS_PASSWORD=$(openssl rand -hex 16)
    echo "Randomly generated redis password: $REDIS_PASSWORD"
fi

# set the password in the redis configuration
redis-cli config set requirepass $REDIS_PASSWORD
sudo systemctl restart redis-server.service

# update the redis configuration to require authentication
sudo sed -i "s/# requirepass foobared/requirepass $REDIS_PASSWORD/g" /etc/redis/redis.conf



#Configure Redis to bind to an IP address entered by the user and allow external connections
read -p "Enter the IP address for Redis to bind to (or press Enter for the default IP): " redis_ip

if [ -z "$redis_ip" ]; then
    redis_ip=""
fi

sudo sed -i "s/bind 127.0.0.1/bind $redis_ip 127.0.0.1/g" /etc/redis/redis.conf
sudo sed -i "s/protected-mode yes/protected-mode no/g" /etc/redis/redis.conf
sudo systemctl restart redis-server.service
echo "Redis configuration updated to allow remote connections and require authentication."