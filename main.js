const socket = io("http://localhost:3000");

const listDiv = ["div-chat", "div-login", "div-toCall", "div-fromCall"];

showDiv("div-login");

$('#endCall').hide();
var userId;

var fromUserId;

var arrUser = [];

socket.on("Danh_Sach_Online", (arrUserInfo) => {
  // console.log(arrUserInfo)
  showDiv("div-chat");
  arrUserInfo.forEach((element) => {
    const { userName, id } = element;
    $("#listUser").append(`<li id="${id}">${userName}</li>`);
  });

  socket.on("Co_Nguoi_Dung_Moi", (user) => {
    // console.log(user, 'user moi')
    const { userName, id } = user;

    if (id !== userId) $("#listUser").append(`<li id="${id}">${userName}</li>`);
  });

  socket.on("Nguoi_Dung_Ngat_Ket_Noi", (id) => {
    $(`#${id}`).remove();
  });
});

socket.on("Cap_Nhat_Nguoi_Dung", (dataUserCall) => {
  console.log(dataUserCall);
  if (dataUserCall.call == "loading") {
    switch (userId) {
      case dataUserCall.idToUser:
        showDiv("div-toCall");

        userId = dataUserCall.idToUser;
        fromUserId = dataUserCall.fromUser;
        // console.log("đang gọi cho ", dataUserCall.from);
        $("#titleTo").append(`Bạn Đang gọi cho ${dataUserCall.from}`);
        break;

      case dataUserCall.fromUser:
        showDiv("div-fromCall");

        userId = dataUserCall.fromUser;
        fromUserId = dataUserCall.idToUser;
        $("#titleFrom").append(`${dataUserCall.to} đang gọi cho bạn`);
        break;

      default:
        break;
    }
  }

  if (dataUserCall.call == false) {
    switch (userId) {
      case dataUserCall.idToUser:
        showDiv("div-chat");
        userId = dataUserCall.idToUser;
        fromUserId = dataUserCall.fromUser;
        // console.log("đang gọi cho ", dataUserCall.from);
        $("#titleTo").empty(``);
        break;

      case dataUserCall.fromUser:
        showDiv("div-chat");
        userId = dataUserCall.fromUser;
        fromUserId = dataUserCall.idToUser;
        $("#titleFrom").empty(``);
        break;

      default:
        break;
    }
  }

  if (dataUserCall.call == true) {
    switch (userId) {
      case dataUserCall.idToUser:
        showDiv("div-chat");
        userId = dataUserCall.idToUser;
        fromUserId = dataUserCall.fromUser;

        openStream().then((stream) => {
          playStream("localStream", stream);
          const call = peer.call(fromUserId, stream);
          call.on("stream", (remoteStream) =>
            playStream("remoteStream", remoteStream)
          );
        });
        $('#endCall').show();
        // console.log("đang gọi cho ", dataUserCall.from);
        $("#titleTo").empty(``);
        break;

      case dataUserCall.fromUser:
        showDiv("div-chat");
        userId = dataUserCall.fromUser;
        fromUserId = dataUserCall.idToUser;
        $("#titleFrom").empty(``);

        // openStream().then((stream) => {
        //   playStream("localStream", stream);
        //   const call = peer.call(userId, stream);
        //   call.on("stream", (remoteStream) =>
        //     playStream("remoteStream", remoteStream)
        //   );
        // });
        break;

      default:
        break;
    }
  }

  // const { userName, id } = user;

  // if (id !== userId) $("#listUser").append(`<li id="${id}">${userName}</li>`);
});

socket.on("Dang_Ky_That_bai", () => {
  alert("Vui lòng chọn user name khác");
});

function showDiv(name) {
  listDiv.forEach((item) => {
    if (item !== name) {
      $(`#${item}`).hide();
    } else {
      $(`#${name}`).show();
    }
  });
}

function openStream() {
  const config = {
    audio: false,
    video: true,
  };
  return navigator.mediaDevices.getUserMedia(config);
}

function playStream(idVideoTag, stream) {
  const video = document.getElementById(idVideoTag);
  video.srcObject = stream;
  video.play();
}

var peer = new Peer();

// show id user and login user
peer.on("open", (id) => {
  userId = id;
  $("#btn-login").click(() => {
    const userName = $("#name-user").val();
    $("#ten").append(`${userName}`);
    socket.emit("Nguoi_Dung_Dang_Ky", { userName, id });
  });
});

// người gọi
// $("#btn-call").click(() => {
//   const id = $("#remoteId").val();
//   openStream().then((stream) => {
//     playStream("localStream", stream);
//     const call = peer.call(id, stream);
//     call.on("stream", (remoteStream) =>
//       playStream("remoteStream", remoteStream)
//     );
//   });
// });

// người nhận
peer.on("call", (call) => {
  // console.log(arrUser);
  openStream().then((stream) => {
    call.answer(stream);
    
  $('#endCall').show();
    playStream("localStream", stream);
    call.on("stream", (remoteStream) =>
      playStream("remoteStream", remoteStream)
    );
  });
});

$("#listUser").on("click", "li", function () {
  const id = $(this).attr("id");
  fromUserId = id;
  socket.emit("Cuoc_Goi", userId, id);
  // openStream().then((stream) => {
  //   playStream("localStream", stream);
  //   const call = peer.call(id, stream);
  //   call.on("stream", (remoteStream) =>
  //     playStream("remoteStream", remoteStream)
  //   );
  // });
});

$("#refuseTo").click(() => {
  socket.emit("Nghe_May", userId, fromUserId, false);
  //   const id = $("#remoteId").val();
  //   openStream().then((stream) => {
  //     playStream("localStream", stream);
  //     const call = peer.call(id, stream);
  //     call.on("stream", (remoteStream) =>
  //       playStream("remoteStream", remoteStream)
  //     );
  //   });
});

$("#accept").click(() => {
  socket.emit("Nghe_May", fromUserId, userId, true);
  //   const id = $("#remoteId").val();
  //   openStream().then((stream) => {
  //     playStream("localStream", stream);
  //     const call = peer.call(id, stream);
  //     call.on("stream", (remoteStream) =>
  //       playStream("remoteStream", remoteStream)
  //     );
  //   });
});

$("#refuseFrom").click(() => {
  socket.emit("Nghe_May", userId, fromUserId, false);
  //   const id = $("#remoteId").val();
  //   openStream().then((stream) => {
  //     playStream("localStream", stream);
  //     const call = peer.call(id, stream);
  //     call.on("stream", (remoteStream) =>
  //       playStream("remoteStream", remoteStream)
  //     );
  //   });
});

$("#endCall").click(() => {
  const call = peer.call(id, stream);
  call.on('close', () => {})
})


