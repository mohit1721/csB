// const express = require('express');
// const app = express();
// const http = require('http');
// const { Server } = require('socket.io');
// const ACTIONS = require('./src/Actions');
// const path = require('path');

// const server=http.createServer(app);//ye http ka server h
// const io=new Server(server);//http ka server socker server ko pass kr diye
// // ye event trigger ho jati h jaise hi koi socket connect ho jata h server ko
// app.use(express.static('build'));
// app.use((req, res, next) => {
//     res.sendFile(path.join(__dirname, 'build', 'index.html'));
// });
// // // 'ihvefonjjoef' :"Mohit Kumar"
// // const userSocketMap={}
// const userSocketMap=new Map();
// function getAllConnectedClients(roomId)
// {
//     //iska type map hota h ..so to convert it to Array use Array,from
//   return Array.from(io?.sockets?.adapter?.rooms?.get(roomId) || [])?.map((socketId)=>{
//     return {
//         socketId,
//         username:userSocketMap[socketId],
//     }
//   });//pure socket server k andar[adaptor k anadar] jitne v rooms h ..usme se jiske v given roomId h usko get krega

// }

// io.on('connection',(socket)=>{
// console.log('socket connected',socket.id)
// // flow
// // jaise hi clinet join krta h...event[ACTIONS.JOIN] triggers from frontend se
// // jo client join ho rha h uska roomId aur username le rhe h
// // uss username kon store krte h map[userSocketMap] k anadar
// // the,us client ko join krate h uss room k anadr[roomId]
// // the,jo us room m oresent h ,sbki ek list get krke sbko notify[io.to krke] kr rhe h..with his username and socketId
// // ab iss event [ACTION.JOINED] ko hmare frontend m listen krna hoga..taki UI update kr paye



// socket?.on(ACTIONS?.JOIN,({roomId,username})=>{
//     // server m store ,user aur socket.io ki mapping
//     // we need to know kon se socketid kon se username ki h
// userSocketMap[socket?.id]=username

// //chn
// //userSocketMap.set(socket.id, username);

// // key,value pair
// socket?.join(roomId);//is socketid ko is roomId k andar join kr dega
// //when more clients present already,notifywhen new client joins
// const clients=getAllConnectedClients(roomId);//client list with object contain username and socketID
// console.log('Clients',clients);
// clients.forEach(({socketId})=>{
//     io?.to(socketId)?.emit(ACTIONS?.JOINED,{
//         clients,
//         username,
//         socketId:socket?.id
//     }) // io.to se jisko notify krna h usko btata h
// })
// })

// // socket.on(ACTIONS.JOIN, ({ roomId, username }) => {
// //     userSocketMap[socket.id] = username;
// //     socket.join(roomId);
// //     const clients = getAllConnectedClients(roomId);
// //     clients.forEach(({ socketId }) => {
// //         io.to(socketId).emit(ACTIONS.JOINED, {
// //             clients,
// //             username,
// //             socketId: socket?.id,
// //         });
// //     });
// // });





// // SYNC CODE
// // JO CODE ALREADY PRESENT H USKO SBHI K EDITOR M SHOW KRNA H
// socket.on(ACTIONS.CODE_CHANGE,({roomId,code})=>{
//     //us room k andar emit krne se saare clients ko chla jayega

//     // DEBUG: io.to-->socket.in...code ki cursor aage nhi badh rhi thi..qki wo khud ko v send kr rha tha..
//     // ab socket.in se ,ye khud ko nhi send krega

//    socket?.in(roomId)?.emit(ACTIONS?.CODE_CHANGE,{code});

// })
// // 
// socket.on(ACTIONS.SYNC_CODE,({socketId,code})=>{
//     //us room k andar emit krne se saare clients ko chla jayega
//   io?.to(socketId)?.emit(ACTIONS?.CODE_CHANGE,{code});

// })


// // disconnect socket on leaving someone..aur sbko norify v kr rhe h
// // jitna v emit kr rhe h ,sbko client p listen krna h
// socket.on('disconnecting',()=>{
//     const rooms= [...socket.rooms];
//     rooms.forEach((roomId)=>{
//         socket.in(roomId).emit(ACTIONS.DISCONNECTED,{
//             socketId:socket.id,
//             username:userSocketMap[socket?.id]
//         })  
//     })
// // map se v delete krna h
// delete userSocketMap[socket?.id];
// socket.leave();//room se officially bahar 
// })

// }) //

// const PORT=process.env.PORT || 5000;
// server.listen(PORT,()=> 

// console.log(`Listening on port ${PORT}`));





///
const dotenv = require("dotenv");
const express = require('express');
const app = express();
const http = require('http');
const { Server } = require('socket.io');
const ACTIONS = require('./Actions');
const path = require('path');
const cors = require("cors");
const server = http.createServer(app);
const io = new Server(server);
dotenv.config();//load dotenv config
const PORT = process.env.PORT || 5000;
app.use(
    cors({
      origin:[ "http://localhost:5000", "https://codes-sync.vercel.app/",""],//"*",  //FOR FRONTEND..//  methods: ["GET", "POST", "PUT", "DELETE"],..VVI..to entertain frontend req.[[http://localhost:3000]] -->:["http://localhost:3000","https://mystudynotion.vercel.app","https://study1-jlkmw7ckr-mohit1721s-projects.vercel.app"], --------------------------["https://mystudynotion.vercel.app"]  
      credentials: true,
    })
  );
//
app.use(express.static('build'));
//page refresh ....3:43:00-->page refresh..krne se server pe koi v request h..index.html ko serve kr dena
app.use((req, res, next) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const userSocketMap = new Map();
//const userSocketMap2={};
// getAllConnectedClients: Yeh function specific room mein connected clients ko return karta hai. 
// Is function se aapko room ke saare connected users ke socket IDs aur usernames milte hain.
function getAllConnectedClients(roomId) {
    return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map((socketId) => {
        return {
            socketId,
            username: userSocketMap.get(socketId),
        };
    });
}
// io.on('connection'): Jab bhi koi naya client connect karta hai, yeh event trigger hota hai. 
// Har connected client ka unique socket ID generate hota hai, jo aap socket.id se access kar sakte ho.
io.on('connection', (socket) => {
    console.log('socket connected', socket.id);

    socket.on(ACTIONS.JOIN, ({ roomId, username }) => {
        userSocketMap.set(socket.id, username);
        socket.join(roomId);

        const clients = getAllConnectedClients(roomId);
        console.log('Clients', clients);
// socket.on(ACTIONS.JOIN): Jab koi client room join karta hai, roomId aur username server ko bheje jaate hain. Yeh client ko us specific room mein add karta hai (socket.join(roomId)).
// userSocketMap.set(): Socket ID aur username ko userSocketMap mein store karta hai.
// getAllConnectedClients(roomId): Room ke andar sabhi connected clients ki list retrieve karta hai.
// clients.forEach(): Har connected client ko event send kiya jaata hai, notifying them that a new user has joined.
        clients.forEach(({ socketId }) => {
            io.to(socketId).emit(ACTIONS.JOINED, {
                clients,
                username,
                socketId: socket.id,
            });
        });
    });
    //  Code Change Broadcasting:
//  Jab ek client apna code change karta hai, toh yeh code room ke sabhi clients ko broadcast hota hai (socket.to(roomId) ensures that the code change is broadcasted to everyone except the sender).
    socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
        socket.to(roomId).emit(ACTIONS.CODE_CHANGE, { code });
    });
    // Code Sync for New Users:
// ACTIONS.SYNC_CODE: Jab koi new user join karta hai, to usko updated code provide karna hota hai. Is event ke through existing users apna code us new user ke socket ID par bhej dete hain.
    socket.on(ACTIONS.SYNC_CODE, ({ socketId, code }) => {
        io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code });
    });
 
    socket.on('disconnecting', () => {
        //socket.rooms:In Socket.io, when a user connects to the server, they can join multiple rooms. Each socket connection has a rooms property that keeps track of all the rooms the socket is currently in.
// This rooms property is typically a Set, which means it automatically handles unique entries (i.e., a socket cannot be in the same room multiple times).
      
const rooms = [...socket.rooms];//creates a new array rooms that contains all the room IDs the socket is currently a part of.
     
// this line is particularly useful when you need to notify all clients in a room when a user is disconnecting. 
        // By converting the Set to an array, you can easily iterate over each room and emit the appropriate events to inform other users.
     
        rooms.forEach((roomId) => {
            socket.to(roomId).emit(ACTIONS.DISCONNECTED, {
                socketId: socket.id,
                username: userSocketMap.get(socket.id),
            });
        });
        userSocketMap.delete(socket.id);
    });
// Reasons for Having Both:
// Timing of Events:
// disconnecting Event: This event is triggered when the socket is in the process of disconnecting but before it is actually removed from the server. It allows you to perform actions (like notifying other users) just before the socket is fully disconnected.
// disconnect Event: This event is triggered after the socket has been fully disconnected. At this point, you can safely clean up any remaining references or data related to that socket, like removing it from the userSocketMap.
   
socket.on('disconnect', () => {
        userSocketMap.delete(socket.id);
    });
});


server.listen(PORT, () => console.log(`Listening on port ${PORT}`));

// In the disconnecting event, you may want to inform other users that someone is leaving the room.
// In the disconnect event, you finalize cleanup operations (like deleting the user from the map), ensuring no references to the disconnected socket remain.