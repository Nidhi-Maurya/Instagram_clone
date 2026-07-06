
// psami1oS54i545ar
// mauryanidhi1610_db_user


// mauryanidhi1610_db_user:psami1oS54i545ar@cluster0.ombhjms.mongodb.net/


// MONGODB_USERNAME="mauryanidhi1610_db_user"
// MONGODB_PASSWORD="psami1oS54i545ar"
// MONGODB_URI="mongodb+srv://mauryanidhi1610_db_user:psami1oS54i545ar@cluster0.ombhjms.mongodb.net"



import mongoose from "mongoose";

const connectDB =async () =>{
  try {
   await  mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB successfully 🔥  ");

  }catch(error){
    console.error("Error connecting to MongoDB:", error);
  }
}


export default connectDB;