#!/bin/bash

# usage sudo ./install_redis.sh <redis_ip> <redis_password> <--no-replace-password>



#Install Redis only if it's not already installed
if ! command -v redis-server &> /dev/null
then
    curl -fsSL https://packages.redis.io/gpg | sudo gpg --dearmor -o /usr/share/keyrings/redis-archive-keyring.gpg
    echo "deb [signed-by=/usr/share/keyrings/redis-archive-keyring.gpg] https://packages.redis.io/deb $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/redis.list
    sudo apt-get update
    sudo apt-get install redis

    #Configure Redis to bind to an IP address entered by the user and allow external connections
    # redis IP is the first argument. If no argument is provided, or if the argument is "null", prompt the user for an IP address

    if [ -z "$1" ] || [ "$1" = "null" ]
    then
        read -p "Enter the IP address for Redis to bind to (or press Enter for the default IP): " redis_ip
            if [ -z "$redis_ip" ]; then
                echo "No IP address provided. Exiting."
                exit 1
            fi
    else
        redis_ip=$1
    fi

    sudo sed -i "s/bind 127.0.0.1/bind $redis_ip 127.0.0.1/g" /etc/redis/redis.conf
    sudo sed -i "s/protected-mode yes/protected-mode no/g" /etc/redis/redis.conf


else
    echo "Redis is already installed."
fi

# Configure Redis to require authentication, if the --no-replace-password flag is provided, the script will skip the password creation if it already exists.

# get the current redis password from the redis configuration
CURRENT_REDIS_PASSWORD=$(sudo grep -oP '(?<=^requirepass ).*' /etc/redis/redis.conf)

# check if redis password already exists using CURRENT_REDIS_PASSWORD to authenticate
if [ "$(redis-cli -a $CURRENT_REDIS_PASSWORD config get requirepass  | grep -c "requirepass")" = '1' ]
then
    # check if --no-replace-password flag is provided, if so, skip password creation
    if [ "$3" = "--no-replace-password" ]
    then
        echo "Redis password already exists. Skipping password creation."
    else
        # if no password provided or password provided was "null", set a random password
        if [ -z "$2" ] || [ "$2" = "null" ]
        then
            REDIS_PASSWORD=$(openssl rand -hex 16)
            echo "Randomly generated redis password: $REDIS_PASSWORD"
        else
            REDIS_PASSWORD=$2
        fi


        # set the password in the redis configuration
        redis-cli -a $CURRENT_REDIS_PASSWORD config set requirepass $REDIS_PASSWORD
        sudo systemctl restart redis-server.service

        # update the redis configuration to require authentication
        sudo sed -i "s/# requirepass foobared/requirepass $REDIS_PASSWORD/g" /etc/redis/redis.conf
        sudo systemctl restart redis-server.service
        echo "Redis configuration updated to require authentication."
    fi
else
    # if no password provided or password provided was "null", set a random password
    if [ -z "$2" ] || [ "$2" = "null" ]
    then
        REDIS_PASSWORD=$(openssl rand -hex 16)
        echo "Randomly generated redis password: $REDIS_PASSWORD"
    else
        REDIS_PASSWORD=$2
    fi

    # set the password in the redis configuration
    redis-cli config set requirepass $REDIS_PASSWORD
    sudo systemctl restart redis-server.service

    # update the redis configuration to require authentication
    sudo sed -i "s/# requirepass foobared/requirepass $REDIS_PASSWORD/g" /etc/redis/redis.conf
    sudo systemctl restart redis-server.service
    echo "Redis configuration updated to require authentication."
fi

#
## check if redis password already exists
#if [ "$(redis-cli config get requirepass  | grep -c "requirepass")" = '1' ]
#then
#    # check if --no-replace-password flag is provided, if so, skip password creation
#    if [ "$3" = "--no-replace-password" ]
#    then
#        echo "Redis password already exists. Skipping password creation."
#    else
#        # if no password provided, set a random password
#        if [ -z "$2" ]
#        then
#            REDIS_PASSWORD=$(openssl rand -hex 16)
#            echo "Randomly generated redis password: $REDIS_PASSWORD"
#        else
#            REDIS_PASSWORD=$2
#        fi
#
#        # set the password in the redis configuration
#        redis-cli config set requirepass $REDIS_PASSWORD
#        sudo systemctl restart redis-server.service
#
#        # update the redis configuration to require authentication
#        sudo sed -i "s/# requirepass foobared/requirepass $REDIS_PASSWORD/g" /etc/redis/redis.conf
#        sudo systemctl restart redis-server.service
#        echo "Redis configuration updated to require authentication."
#    fi
#else
#    # if no password provided, set a random password
#    if [ -z "$2" ]
#    then
#        REDIS_PASSWORD=$(openssl rand -hex 16)
#        echo "Randomly generated redis password: $REDIS_PASSWORD"
#    else
#        REDIS_PASSWORD=$2
#    fi
#
#    # set the password in the redis configuration
#    redis-cli config set requirepass $REDIS_PASSWORD
#    sudo systemctl restart redis-server.service
#
#    # update the redis configuration to require authentication
#    sudo sed -i "s/# requirepass foobared/requirepass $REDIS_PASSWORD/g" /etc/redis/redis.conf
#    sudo systemctl restart redis-server.service
#    echo "Redis configuration updated to require authentication."
#fi

echo "Redis installation complete."
exit 0