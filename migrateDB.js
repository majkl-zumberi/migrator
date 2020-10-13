const copydb = require('mongo-copydb');
const fs=require("fs");
const mongodbUri = require('mongodb-uri');
require('dotenv').config();

const fileName=process.env.MIGRATION_FILE_PATH;
 
async function migrateDbs() {
  console.log("tento di copiare i db")

  fs.readFile(fileName,(err,data)=>{
  if(err){
        console.log(err);
  }else{
      //console.log(JSON.parse(data));
      /**
       * prendo in considerazione solo l'array che 
       * contiene il MONGODB_URI, non quelli da controllare a mano
       */
      let migrationData= JSON.parse(data).migrate;

      let promiseArray=migrationData.map(database=>{
        let uri = database.MONGODB_URI;
        let uriObject = mongodbUri.parse(uri);
        /**
         * esempio di uriObject
         * {
              "scheme": "mongodb",
              "database": "authJWT",
              "hosts": [
                {
                  "host": "localhost",
                  "port": 27017
                }
              ]
            }
         */
        console.log(JSON.stringify(uriObject, null, 2));
        if("username" in uriObject && "password" in uriObject){
          return copydb(uriObject.database, uriObject.database+"_migrated", {
            username: uriObject.username,
            password: uriObject.password,
            fromhost: `${uriObject.hosts[0].host}:${uriObject.hosts[0].port}`,
            tohost:process.env.MIGRATION_HOST && process.env.MIGRATION_PORT ?`${process.env.MIGRATION_HOST}:${process.env.MIGRATION_PORT}`:`${uriObject.hosts[0].host}:${uriObject.hosts[0].port}` 
          });
        } else{
          return copydb(uriObject.database, uriObject.database+"_migrated", {
            tohost:process.env.MIGRATION_HOST && process.env.MIGRATION_PORT ?`${process.env.MIGRATION_HOST}:${process.env.MIGRATION_PORT}`:`${uriObject.hosts[0].host}:${uriObject.hosts[0].port}` 
          });
        }
      });

      Promise.all(promiseArray).then(()=>{
          console.log("all dbs are successfully migrated")
      }).catch(err=> {throw err})

  }
});

}
migrateDbs();