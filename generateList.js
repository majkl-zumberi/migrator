require('dotenv').config()
const axios = require('axios');
const path=require("path");
const fs=require("fs");

const myPath=path.join(__dirname,"./build","migration_list.json");

const getEnvironmentVariables= async(list)=>{
  
    var promiseArray= list.map( async (project)=>{
      return axios.get(process.env.BASE_URL ? process.env.BASE_URL+project.id+"/config-vars" : `https://api.heroku.com/apps/${project.id}/config-vars`, {
            headers:{
              Authorization:`Bearer ${process.env.TOKEN}`,
              Accept:'application/vnd.heroku+json; version=3'
            }
          }).then((request)=>{
            return {environment:request,project}
          })
    })
  
    return Promise.all(promiseArray).then(results=>{
      let listApp={"migrate":[],"check":[]};
      results.map(({environment,project})=>{
                //console.log(environment.data);
                if('MONGODB_URI' in environment.data){
                  console.log(`da migrare ${project.name}`);
                  listApp["migrate"].push({...project,...environment.data});
                  //console.log(listApp)
                } else{
                  console.log(`controllare a mano ${project.name}`);
                  listApp["check"].push({...project,...environment.data});
                  //console.log(listApp);
                }
      })
      //console.log(listApp)
      return listApp
    })
  }
  
  const getHerokuApps=async ()=>{
    
    let filtered;
    let response= await axios.get(process.env.BASE_URL || "https://api.heroku.com/apps/", {
      headers:{
        Authorization:`Bearer ${process.env.TOKEN}`,
        Accept:'application/vnd.heroku+json; version=3'
      }
    })
    //console.log(response.data);
    // .catch(function (error) {
    //   console.log(error);
    // });
    filtered=response.data.map(app=>({name:app.name,id:app.id}));
    //console.log(filtered);
   const lista= await getEnvironmentVariables(filtered);

   fs.writeFile(myPath,JSON.stringify(lista),err=>{
    if(err) throw err;
    console.log("Lista generata in /build");
   }); 
  }
getHerokuApps();