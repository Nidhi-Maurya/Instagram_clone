
//!  chattinng system 

import { Conversation } from "../models/conversation.modal.js";
import {Message} from "../models/message.modal.js"
import User from "../models/user.model.js";
import { getIO, getReceiverSocketId } from "../socket.js";


// ! SEND MESSAGE


export  const sendMessage = async(req,res)=>{
  try {
    const senderId= req.id;
    const receiverId= req.params.id;
    const {message} = req.body;
    let  conversation = await  Conversation.findOne({
      participants:{$all:[senderId,receiverId]}
    });
    //! stablish the conversation if not started yet 

    if(!conversation){
      conversation = await Conversation.create({
        participants:[senderId,receiverId]
      })
    };
    const newMessage =await Message.create({
      senderId,
      receiverId,
      message
    });

    if(newMessage) conversation.messages.push(newMessage._id);

    await Promise.all([conversation.save(),newMessage.save()])

    const receiverSocketId = getReceiverSocketId(receiverId);
    if(receiverSocketId){
      getIO()?.to(receiverSocketId).emit("newMessage", newMessage);
      const sender = await User.findById(senderId).select("username profilePicture");
      getIO()?.to(receiverSocketId).emit("messageNotification", {
        type: "message",
        userId: senderId,
        userDetails: sender,
        message: newMessage.message,
        createdAt: newMessage.createdAt || new Date().toISOString(),
      });
    }


    return res.status(201).json({
      success:true,
      newMessage,
    })

  } catch(err){
    console.log(err);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
}



// ! GET MESSAGE 


export const getMessage = async (req,res) =>{
  try{
    const senderId=req.id;
    const receiverId= req.params.id;
    const conversation = await Conversation.findOne({
      participants:{$all: [senderId,receiverId]}
    }).populate("messages");

    if(!conversation) return res.status(200).json({
      success:true, messages:[]
    });

    return res.status(200).json({success:true,messages:conversation?.messages})

  }catch(err){
    console.log(err)
  }
}
