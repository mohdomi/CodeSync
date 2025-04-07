import mongoose from 'mongoose';

console.log(typeof(process.env.MONGO_URI))

function createConnection(){
    mongoose.connect(process.env.MONGO_URI).then(()=>{
        console.log("db connected")
    }).catch(err=>{
        console.log("MongoDb Error : " , err)
    })
}
 

export default createConnection;