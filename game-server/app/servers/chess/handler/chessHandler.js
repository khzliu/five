var Player = require('../../../model/player');
module.exports = function(app) {
     return new Handler(app);
};

var Handler = function(app) {
     this.app = app;
     this.channelService = this.app.get('channelService');
};

var handler = Handler.prototype;
handler.createorjoin = function(msg, session, next) {
     var channel = this.channelService.getChannel(session.get('channel'), false);
     console.log('create channelId:' + session.get('channel'));
     if ( !! channel) {

          if (channel.rooms[msg.room].status == '空房间') {
               var gameRoom = channel.rooms[msg.room];
               var player = channel.userMap[session.uid];
               gameRoom.host = player;
               player.room = msg.room;
               gameRoom.status = '等待中';
               this.postRoomStatus(channel);
               next(null, {
                    code: 200,
                    msg: gameRoom.host.name
               });

          } else if (channel.rooms[msg.room].status == '等待中') {
               var gameRoom = channel.rooms[msg.room];
               var player = channel.userMap[session.uid];
               gameRoom.guest = player;
               player.room = msg.room;
               gameRoom.status = '就绪';
               gameRoom.sendGuestJoin();
               this.postRoomStatus(channel);
               next(null, {
                    code: 200,
                    msg: gameRoom.host.name
               });
          } else {
               next(null, {
                    code: 500,
                    msg: '这个房间人数已满无法加入!'
               });
               return;


          }



     } else
          console.log('create channel not found');
}
handler.begin = function(msg, session, next) {
     var channel = this.channelService.getChannel(session.get('channel'), false);

     if ( !! channel) {
          var player = channel.userMap[session.uid];
          channel.rooms[player.room].begin(player);
          channel.rooms[player.room].status = '游戏中';
          this.postRoomStatus(channel);
          next(null, {
               code: 200,
               cmd: 'chessBegin'
          });
     }
}

handler.reset = function(msg, session, next) {
     var channel = this.channelService.getChannel(session.get('channel'), false);
     if ( !! channel) {
          var player = channel.userMap[session.uid];
          var gameRoom = channel.rooms[player.room];
          if (player == gameRoom.host) gameRoom.sendChessReset(gameRoom.guest);
          else if (player == gameRoom.guest) gameRoom.sendChessReset(gameRoom.host);
     }
}

handler.chess = function(msg, session, next) {
     var channel = this.channelService.getChannel(session.get('channel'), false);
     console.log('chess room:' + msg.room);
     if ( !! channel) {
          var player = channel.userMap[session.uid];
          var result = channel.rooms[player.room].playChess(player, msg.position);
          next(null, result);
     }
}

handler.exit = function(msg, session, next) {
     var channel = this.channelService.getChannel(session.get('channel'), false);
     console.log('exit room:' + msg.room);
     if ( !! channel) {
          var player = channel.userMap[session.uid];
          var gameRoom = channel.rooms[player.room];
          if (player == gameRoom.host) {
               if (gameRoom.guest != null) {
                    gameRoom.sendPlayerExit(player.name, gameRoom.guest);
                    gameRoom.host = gameRoom.guest;
                    gameRoom.status = '等待中';
               } else {
                    gameRoom.host = null;
                    gameRoom.status = '空房间';
               }
          } else if (player == gameRoom.guest) {
               console.log('exit guest exit');
               gameRoom.sendPlayerExit(player.name, gameRoom.host);
               gameRoom.status = '等待中';
          }
          gameRoom.guest = null;
          this.postRoomStatus(channel);
          next(null, {
               code: 200
          });
     }
}

handler.refreshRoomStatus = function(msg, session, next) {
     var channel = this.channelService.getChannel(session.get('channel'), false);
     if ( !! channel) {
          this.postRoomStatus(channel);
          next(null, {
               code: 200
          });
     }
}

handler.doExit = function(channel, player) {
     console.log('do exit room:' + player.room);
     if ( !! channel) {
          var gameRoom = channel.rooms[player.room];
          if ( !! gameRoom) {
               if (player == gameRoom.host) {
                    if (gameRoom.guest != null) {
                         gameRoom.sendPlayerExit(player.name, gameRoom.guest);
                         gameRoom.host = gameRoom.guest;
                         gameRoom.status = '等待中';
                    } else {
                         gameRoom.host = null;
                         gameRoom.status = '空房间';
                    }
               } else if (player == gameRoom.guest) {
                    console.log('doExit guest exit');
                    gameRoom.sendPlayerExit(player.name, gameRoom.host);
                    gameRoom.status = '等待中';
               }
               gameRoom.guest = null;
               this.postRoomStatus(channel);
          }
     }
}

handler.postRoomStatus = function(channel) {
     console.log('postRoomStatus');
     var data = getRoomStatus(channel);
     channel.pushMessage({
          route: 'onStatus',
          rooms: data
     });
}



function getPlayer(session) {
     return Player(session.get('name'), session.uid, session.get('sid'));
}

function getRoomStatus(channel) {
     var data = [];
     for (var i = 0; i < channel.rooms.length; i++) {
          data[i] = channel.rooms[i].getRoomStatus();
     }
     return data;
}

module.exports.getRoomStatus = getRoomStatus;