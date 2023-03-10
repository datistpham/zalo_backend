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
  socket.on("message_from_client", (data) => {
    io.to(data.roomId).emit("broadcast_to_all_user_in_room", { ...data });
  });
  socket.on("typing_from_client_on", (data) => {
    socket
      .to(data.roomId)
      .emit("broadcast_to_all_user_in_room_typing", { data });
  });
  socket.on("typing_from_client_off", (data) => {
    socket
      .to(data.roomId)
      .emit("broadcast_to_all_user_in_room_typing", { data });
  });
  // recall message
  socket.on("recall_message", (data) => {
    io.to(data.idConversation).emit("recall_message_server", {
      type: "text",
      message: "Tin nhắn đã được thu hồi",
      ...data,
    });
  });
  //
  socket.on("remove_message", (data) => {
    io.to(data.idConversation).emit("remove_message_server", {
      type: "text",
      message: "Tin nhắn đã xóa",
      ...data,
    });
  });
  // call signal
  // sender push singnal
  socket.on("start_call", (data)=> {
    socket.join(data.call_id)
    io.emit("signal_to_user", {call_id: data.call_id, user_to_call: data.user_to_call, senderInfo: data?.senderInfo})
  })

  socket.on("receiver_to_call", (data)=> {
    socket.join(data.call_id)
    io.to(data.call_id).emit("init_message_call", {call_id: data.call_id, member: io.sockets.adapter.rooms.get(`${data.call_id}`)})
  })
  // decline call
  socket.on("decline_call", (data)=> {
    io.to(data.call_id).emit("decline_call_signal", {decline: true})
  })
  // accept call
  socket.on("accept_call", (data)=> {
    // socket.join(data.call_id)
    io.to(data.call_id).emit("accept_call_signal", {accept: true, call_id: data.call_id})
  })
  // sender end call
  socket.on("sender_end_call", (data)=> {
    io.to(data.call_id).emit("end_call_from_sender", {end_call: true})
  })
  // sender or receiver end call
  socket.on("end_call", (data)=> {
    io.to(data.call_id).emit("end_call_from_user", {end_call: true})
  })
  
};

module.exports = SocketServer;
