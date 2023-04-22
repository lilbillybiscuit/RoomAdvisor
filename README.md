# Yale RoomAdvisor

Search, Shop, Review dorm rooms here at Yale!

## Getting Started

### Prerequisites

* [Node.js](https://nodejs.org/en/)
* [PostgreSQL](https://www.postgresql.org/)
* [NPM](https://www.npmjs.com/x)

### Installing

#### Clone the repository
```shell
git clone https://github.com/lilbillybiscuit/RoomAdvisor/settings
cd RoomAdvisor
```

#### Install Backend Dependencies
```shell
cd backend && npm install
```

#### Install Frontend Dependencies
```shell
cd frontend && npm install --legacy-peer-deps
```

#### Copy configs/config.js.template to config.js
```shell
cp configs/config.js.template config.js
```

#### Modify config.js to match your local environment
Inside config.js you will need to modify the following fields:
```
postgres: {
    host: "localhost",
    port: 5432,
    user: "roomadvisor",
    password: "password",
    database: "roomadvisor"
}
```

Modify these values to fit your installation of PostgreSQL.

#### Initialize the database tables
```shell
node utils/database/createDatabase.js
```

#### (Optional) Launch Terraform to create AWS resources
You will only need this if you are working outside of RoomAdvisor
```shell
cd infrastructure/image_pipeline/ && terraform init
terraform apply
```


#### Start the server
Create a new shell and run the following command:
```shell
cd backend
npm start
```

#### Start the frontend
Create a new shell and run the following command:
```shell
cd ../frontend
npm start
```

And yay! You have gotten the server and frontend running. You can now access the website at http://localhost:3000

# Credits
We appreciate Alara and Abraham for providing the [starting code](https://github.com/Abee007/Room-Advisor-Handoff) to RoomAdvisor in their senior thesis. 
