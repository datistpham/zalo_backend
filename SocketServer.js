const conversationsCrl = require("./controller/conversationsCrl");

let users = [];

const SocketServer = (socket, io) => {
  console.log("Co nguoi vua ket noi", socket.id);
  io.emit("me", socket.id)

  // Connect - Disconnect
  socket.on("joinUser", (user) => {
    users.push({
      id: user._id,
      socketId: socket.id,
      friends: user.friends,
      username: user.username,
      profilePicture: user.profilePicture,
      phoneNumber: user.phoneNumber,
    });
  });
  
  socket.on("disconnect", () => {
    socket.broadcast.emit("callEnded")
  });
  socket.on("callUser", data=> {
    io.to(data.userToCall).emit("callUser", {signal: data.signalData, from: data.from, name: data.name})
  })
  socket.on("answerCall", (data)=> {
    io.to(data.to).emit("callAccepted", data.signal)
  })

  // rebuild message
  socket.on("join_room_conversation", (data) => {
    socket.join(`${data.roomId}`);
    socket.emit("connect_room_conversation", { roomId: data.roomId });
  });

  socket.on("message_from_client", async (data) => {
    await io.in(data.roomId).emit("broadcast_to_all_user_in_room", { ...data })
    if(data?.type_message === "text_to_voice") {
      socket.broadcast.to(data?.roomId).emit("auto_playing_audio", {voice: data?.message, roomId: data?.roomId, keyId: data?.key});
    }
  });
  socket.on("send_message_key_id", (data)=> {
    io.in(data?.roomId).emit("auto_playing_audio", {voice: data?.message, roomId: data?.roomId, keyId: data?.key, sender: data?.sender});
  })
  socket.on("typing_from_client_on", (data) => {
    socket
      .broadcast
      .to(data.roomId)
      .emit("broadcast_to_all_user_in_room_typing", { data });
  });
  socket.on("typing_from_client_off", (data) => {
    socket
      .broadcast
      .to(data.roomId)
      .emit("broadcast_to_all_user_in_room_typing", { data });
  });
  // recall message
  socket.on("recall_message", (data) => {
    io.to(data.idConversation).emit("recall_message_server", {
      ...data,
      type: "text",
      message: "Tin nhắn đã được thu hồi",
    });
  });
  //
  socket.on("remove_message", (data) => {
    io.to(data.idConversation).emit("remove_message_server", {
      ...data,
      type: "text",
      message: "Tin nhắn đã xóa",
    });
  });
  // call signal
  // sender push singnal
  socket.on("start_call", (data)=> {
    socket.join(data.call_id)
    io.emit("signal_to_user", {call_id: data.call_id, user_to_call: data.user_to_call, senderInfo: data?.senderInfo, idConversation: data?.idConversation})
  })

  socket.on("receiver_to_call", (data)=> {
    socket.join(data.call_id)
    io.to(data.call_id).emit("init_message_call", {call_id: data.call_id, member: io.sockets.adapter.rooms.get(`${data.call_id}`), idConversation: data?.idConversation})
  })
  // decline call
  socket.on("decline_call", (data)=> {
    io.to(data.call_id).emit("decline_call_signal", {decline: true})
  })
  // accept call
  socket.on("accept_call", (data)=> {
    // socket.join(data.call_id)
    io.to(data.call_id).emit("accept_call_signal", {accept: true, call_id: data.call_id, idConversation: data?.idConversation})
  })
  // sender end call
  socket.on("sender_end_call", (data)=> {
    io.to(data.call_id).emit("end_call_from_sender", {end_call: true})
  })
  // sender or receiver end call
  socket.on("end_call", (data)=> {
    io.to(data.call_id).emit("end_call_from_user", {end_call: true})
  })

  // send request make friends 
  socket.on("send_request_friend", (data)=> {
    io.emit("new_request_friend", {sender_user_id: data.sender_user_id, destination_user_id: data.destination_user_id})
  })

  // new message notify
  socket.on("send_new_message", (data)=> {
    socket.broadcast.emit("send_new_message_from_server", {...data})
  })

  // newest message 
  socket.on("update_newest_message", (data)=> {
    conversationsCrl.updateLastUpdate(data.roomId, data.lastUpdate)
    io.emit("newest_message", {...data})
    socket.broadcast.emit("newest_message_sound", {...data})
  })
  // join self
  socket.on("join_room_self", (data)=> {
    socket.join(data?.meId || "")
  })

  socket.on("update_profile_user", (data)=> {
    io.in(data?.meId).emit("update_profile_user_on", {data: data?.meId})
  })
};

module.exports = SocketServer;
