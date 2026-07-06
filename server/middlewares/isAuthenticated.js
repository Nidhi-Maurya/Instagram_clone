

import jwt from "jsonwebtoken";

const isAuthenticated = async (req,res,next)=>{
try {
  const token = req.cookies.token;
    // console.log("TOKEN:", token);
  if(!token){

      
    return res.status(401).json({
      message:'User not authenticated',
      success:false
    })
  }
const decode= await jwt.verify(token,process.env.SECRET_KEY);
    // console.log("DECODE TOKEN:", decode);
if(!decode) {
    return res.status(401).json({
      message:'invalid credentials',
      success:false
    })
}

    req.id = decode.userId || decode.id || decode._id;

    // console.log("REQ ID:", req.id);
next();


}catch(error){
  console.log(error);
}
}


export default isAuthenticated