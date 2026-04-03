import { Server } from "socket.io"

let io;


export function initSocket(httpServer){
    io = new Server(httpServer, {
        cors: {
            origin: "http://localhost:5173",
            credentials: true,
        }
    })


    io.on("connection", (socket)=>{
        console.log("A user connected: " +socket.id) //unique user id that changes everytime a new connection is created
    })
}