const mongoose=require("mongoose");
require("dotenv").config();

const dbconnect=()=>{
    mongoose.connect(process.env.MONGODB_URL)

    
    .then(()=>console.log("Db connection successfully"))
    .catch(err=>console.log(err));
}

module.exports = dbconnect;