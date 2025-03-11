import mongoose from 'mongoose';

console.log(process.env.MONGO_URI)

function connect(){
    mongoose.connect(process.env.MONGO_URI).then(()=>{
        console.log("db connected")
    }).catch(err=>{
        console.log(err)
    })
}


export default connect;