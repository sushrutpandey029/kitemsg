const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const messageRoutes = require("./routes/messages");
const app = express();
const socket = require("socket.io");
require("dotenv").config();

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB Connetion Successfull");
  })
  .catch((err) => {
    console.log(err.message);
  });

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

const server = app.listen(process.env.PORT, () =>
  console.log(`Server started on ${process.env.PORT}`)
);

const io = socket(server, {
  cors: {
    origin: "https://kitesocketserver.onrender.com",
    credentials: true,
  },
  
});
var clients = {};
// console.log(clients);

io.on('connection', (socket)=>{
  console.log("connected");
  console.log(socket.id,"has joined");
  socket.on("/test",(id)=>{
    console.log(id);
    clients[id] = socket;
    console.log(clients);
  });

  socket.on("send-msg", (msg) => {
    console.log(msg);
    let reciever_id= msg.reciever_id;
    if(clients[reciever_id]) clients[reciever_id].emit("msg-recieve", msg);
    console.log(reciever_id);
  });

  socket.on("send-grp-msg", (data)=>{
    console.log(data);
    let sender_id = data.sender_id;
    if(clients[sender_id]) clients[sender_id].emit('grp-message-recieve',data)

  });
});
