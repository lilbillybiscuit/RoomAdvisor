#!/bin/bash

DB_NAME="roomadvisor"
DB_USER="roomadvisor"
DB_PASS="$1"

# Check of ACL is installed
if ! command -v getfacl &> /dev/null
then
    echo "ACL is not installed. Installing now..."
    sudo apt-get update
    sudo apt-get install acl -y
    echo "ACL installed successfully."
else
  echo ""
fi

sudo setfacl -R -m u:ubuntu:rwx,d:u:ubuntu:rwx,u:postgres:rwx,d:u:postgres:rwx /home/ubuntu

# Generate a random password if no argument is provided
if [ -z "$DB_PASS" ]
then
    DB_PASS=$(openssl rand -hex 12)
    echo "No password provided. Generated password is: $DB_PASS"
else
    echo "Password provided: $DB_PASS"
fi

# Check if PostgreSQL is installed, if not install it
if ! command -v psql &> /dev/null
then
    sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
    wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
    sudo apt-get update
    sudo apt-get -y install postgresql
fi

# Check if database with the same name already exists
if [ "$(sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" 2>/dev/null)" = '1' ]
then
    read -p "Database '$DB_NAME' already exists. Do you want to continue and overwrite it? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]
    then
        # Drop the existing database
        sudo -u postgres dropdb $DB_NAME
    else
        echo "Database initialization terminated by user."
        exit 1
    fi
fi

# Edit postgresql.conf to listen to all addresses
sudo sed -i "s/#listen_addresses =.*/listen_addresses = \'*\'/g" /etc/postgresql/*/main/postgresql.conf

# Edit pg_hba.conf to allow connections from all addresses
sudo echo "host    all             all             0.0.0.0/0               md5" | sudo tee -a /etc/postgresql/*/main/pg_hba.conf

# Restart PostgreSQL to apply changes
sudo service postgresql restart

# Check if user with the same name already exists
if [ "$(sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'" 2>/dev/null)" = '1' ]
then
    read -p "User '$DB_USER' already exists. Do you want to continue and overwrite it? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]
    then
        # Drop the existing user
        sudo -u postgres dropuser $DB_USER
    else
        echo "Database initialization terminated by user."
        exit 1
    fi
fi

# Create the database
sudo -u postgres createdb $DB_NAME
echo "Database '$DB_NAME' created successfully."

# Create the database user and set its password
sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';"
echo "User '$DB_USER' created successfully."

# Grant all privileges to the user on the database
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
echo "Privileges granted successfully."


echo "Database initialization complete."
echo "To connect to the database remotely, use the following parameters:"
echo "Host: <IP address of your machine>"
echo "Port: 5432 (default)"
echo "Database name: $DB_NAME, user: $DB_USER, password: $DB_PASS"