const httpServer = require("http").createServer();
const io = require("socket.io")(httpServer, {
  cors: {
    origin: "http://localhost:5000",
  },
});

httpServer.listen(3000);

const arrUserInfo = [];
var dataUserCall = {
  idToUser: "",
  fromUser: "",
  to: "",
  from: "",
  call: "",
};

io.on("connection", (socket) => {
  socket.on("Nguoi_Dung_Dang_Ky", (user) => {
    const isExist = arrUserInfo.some((e) => e.userName == user.userName);
    if (isExist) return socket.emit("Dang_Ky_That_bai");
    arrUserInfo.push({ ...user, idSocket: socket.id });
    socket.emit("Danh_Sach_Online", arrUserInfo);
    socket.broadcast.emit("Co_Nguoi_Dung_Moi", user);
  });

  socket.on("Cuoc_Goi", (toUser, fromUser) => {
    console.log(arrUserInfo);
    const idToUser = arrUserInfo.findIndex((user) => user.id == toUser);
    const idFromUser = arrUserInfo.findIndex((user) => user.id == fromUser);
    dataUserCall = {
      idToUser: toUser,
      fromUser: fromUser,
      to: arrUserInfo[idToUser].userName,
      from: arrUserInfo[idFromUser].userName,
      call: "loading",
    };
    var fromIdS = arrUserInfo[idFromUser].idSocket;
    socket.to(fromIdS).emit("Cap_Nhat_Nguoi_Dung", dataUserCall);
    socket.emit("Cap_Nhat_Nguoi_Dung", dataUserCall);
  });

  socket.on("Nghe_May", (toUser, fromUser, isAccept) => {
    if (toUser == dataUserCall.idToUser && fromUser == dataUserCall.fromUser) {
      dataUserCall = {
        idToUser: dataUserCall.idToUser,
        fromUser: dataUserCall.fromUser,
        to: dataUserCall.to,
        from: dataUserCall.from,
        call: isAccept,
      };
      const idFromUser = arrUserInfo.findIndex((user) => user.id == fromUser);
      var fromIdS = arrUserInfo[idFromUser].idSocket;
      
      const idToUser = arrUserInfo.findIndex((user) => user.id == toUser);
      var toIdS = arrUserInfo[idToUser].idSocket;
      socket.to(fromIdS).emit("Cap_Nhat_Nguoi_Dung", dataUserCall);
      socket.to(toIdS).emit("Cap_Nhat_Nguoi_Dung", dataUserCall);
      socket.emit("Cap_Nhat_Nguoi_Dung", dataUserCall);
    }
  });

  socket.on("disconnect", () => {
    const index = arrUserInfo.findIndex((user) => user.id == socket.id);
    arrUserInfo.splice(index, 1);
    io.emit("Nguoi_Dung_Ngat_Ket_Noi", socket.id);
  });
});
