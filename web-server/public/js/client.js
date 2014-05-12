var pomelo = window.pomelo;
var queryhost = "192.168.6.1";
var queryPort = "3015";
var connectHost = "-1";
var connectPort = "-1";
var myrole;
var table;
var playing = false;
var userName;
var room = -20130820;
var previousroom = -20130830;
var islogout;
var channelId;
var ipaddr = 'http://192.168.6.1:3001'

	function chessHandler(data) {
		switch (data.cmd) {
			case 'guestJoin':
				$("#startBtn").button("enable");
				$("#restartBtn").button("disable");
				document.getElementById("wName").innerHTML = data.guestName;
				if (confirm(data.guestName + ' 进来了！！！是否开始游戏？')); {
					pomelo.request("chess.chessHandler.begin", {
							room: room
						},
						function(data) {
							startGame();
						});
				}
				break;

			case 'playerExit':
				alert(data.name + ' 离开了！!');
				$("#startBtn").button("disable");
				$("#restartBtn").button("disable");
				if (myrole == 'guest') document.getElementById("bName").innerHTML = userName;
				document.getElementById("wName").innerHTML = "白方玩家";
				$("#blackPlay").fadeOut();
				$("#whitePlay").fadeOut();
				pieceBox.innerHTML = "";
				playing = false;
				myrole = 'host';
				break;

			case 'playChess':
				setPiece(data.position, data.role);
				if (data.role == 'guest') {
					$("#whitePlay").fadeOut();
					$("#blackPlay").fadeIn();
				} else if (data.role == 'host') {
					$("#blackPlay").fadeOut();
					$("#whitePlay").fadeIn();
				}
				break;

			case 'result':
				alert(data.winner + ' 赢了！！');
				playing = false;
				pieceBox.innerHTML = "";
				if (myrole == 'host') {
					$("#restartBtn").button("disable");
					$("#startBtn").button("enable");

				}
				break;

			case 'chessBegin':
				alert("游戏开始！！！");
				startGame();
				break;

			case 'chessReset':
				if (confirm(data.name + ' 请求重新开始游戏?')) {
					pomelo.request("chess.chessHandler.begin", {
							room: room
						},
						function(data) {
							startGame();
						});
				}
				break;
		}
	}

	function updateRoomStatus(data) {
		table.fnClearTable();
		table.fnAddData(data.rooms, true);
		$("#example tbody tr").click(function() {
			createOrJoin(table.fnGetPosition(this));
		});
	}

	function createOrJoin(op) {
		room = op;
		pomelo.request("chess.chessHandler.createorjoin", {
			room: room
		}, function(data) {
			_createOrJoin(data);
			if (data.code == 200) {
				$("#startBtn").attr("disabled", true);
				$("#restartBtn").attr("disabled", true);
				$("#exitBtn").attr("disabled", false);
				$.mobile.changePage("#chessboard", {
					changeHash: true,
				});
			}
		});
	}

	function _createOrJoin(data) {
		if (data.code == 200) {
			previousroom = room;
			host = data.msg;
			if (host == userName) {
				myrole = "host";
				document.getElementById("bName").innerHTML = userName;
			} else {
				myrole = "guest"
				document.getElementById("wName").innerHTML = userName;
				document.getElementById("bName").innerHTML = host;
			}
			pieceBox.innerHTML = "";
		} else if (data.code == 500) {
			alert(data.msg);
		}
	}

	function playChess(position) {
		pomelo.request("chess.chessHandler.chess", {
				position: position,
				room: room
			},
			function(data) {
				if (data.code == 500)
					alert(data.msg);
			});
	}

	function login(channelId, username) {
		pomelo.request("connector.entryHandler.login", {
				username: username,
				channelId: channelId
			},
			function(data) {
				if (data.code == 200) {
					islogout = false;
					userName = username;
					$('#demo').html('<table cellpadding="0" class="display" id="example"></table>');
					table = $('#example').dataTable({
						"aaData": data.rooms,
						"aoColumns": [{
							"sTitle": "房间"
						}, {
							"sTitle": "玩家"
						}, {
							"sTitle": "状态"
						}]
					});
					$("#example tbody tr").click(function() {
						createOrJoin(table.fnGetPosition(this));
					});
					uname1.innerHTML = "你好,"+userName;
					uname2.innerHTML = "你好,"+userName;
					$.mobile.changePage("#roomlist", {
						changeHash: true
					});
				} else {
					alert(username + ' 已经在这个频道了！！');
					pomelo.disconnect();
					pomelo.init({
							host: queryhost,
							port: queryPort,
							log: true
						},
						null);
					if (location.href != ipaddr + '/fivechess.html')
					    window.location.href = ipaddr + "/fivechess.html";
				}
			});

	}


	function startGame() {
		pieceBox.innerHTML = "";
		createMap();
		bindEvent();
		playing = true;
		$("#startBtn").button("disable");
		$("#restartBtn").button("enable");
		$("#blackPlay").fadeIn();
	}

	function exitGame() {
		pomelo.request("chess.chessHandler.exit", {
				room: room
			},
			function(data) {
				if (data.code == 200) {
					if (iArray != null) unbindEvent();
					playing = false;
					$("#restartBtn").button("disable");
					$("#startBtn").button("disable");
					$("#blackPlay").fadeOut();
					$("#whitePlay").fadeOut();
					document.getElementById("bName").innerHTML = "黑方玩家";
					document.getElementById("wName").innerHTML = "白方玩家";
				}
			});
	}

	function init() {
		pomelo.init({
				host: queryhost,
				port: queryPort,
				log: true
			},
			function() {
				if (location.href != ipaddr + '/fivechess.html')
					window.location.href = ipaddr + "/fivechess.html";

			});
	}

$(document).ready(function() {
	adjustToScreen();
	init();
	pomelo.on('onStatus', updateRoomStatus);
	pomelo.on('onChess', chessHandler);
	$.mobile.page.prototype.options.domCache = true;

	window.onhashchange = function() {
		if (location.href == ipaddr + '/fivechess.html') {
			pomelo.disconnect();
			init();
			islogout = true;
		}
		if (location.href == ipaddr + '/fivechess.html#roomlist') {
		if(connectPort == "-1" || connectHost == "-1")
				window.location.href = ipaddr + "/fivechess.html";
			pomelo.request("chess.chessHandler.refreshRoomStatus", {}, function(data) {});
			if (!islogout) {
				if (room == -20130820)
					return;
				else {
					if (playing) {
						if (!confirm(" 您正在游戏中，确定退出？？")) {
							window.location.href = "#chessboard";
							return;
						}
					}
					exitGame();
					room = -20130820;

				}
			}
			if (islogout) {
				pomelo.init({
						host: connectHost,
						port: connectPort,
						log: true
					},
					function() {
						pomelo.request("connector.entryHandler.login", {
								username: userName,
								channelId: channelId
							},
							function(data) {
								if (data.code == 200) {
									islogout = false;
								} else {
									alert(userName + ' 已经在这个频道了！！');
									pomelo.disconnect();
									pomelo.init({
											host: queryhost,
											port: queryPort,
											log: true
										},
										null);
									if (location.href != ipaddr + '/fivechess.html')
					                    window.location.href = ipaddr + "/fivechess.html";
								}
							}
						);
					}
				);
			}
		}

		if (location.href == ipaddr + '/fivechess.html#chessboard') {
			if(previousroom == -20130830)
				window.location.href = ipaddr + "/fivechess.html";
			if (room != -20130820)
				return;
			room = previousroom;
			pomelo.request("chess.chessHandler.createorjoin", {
					room: room
				},
				function(data) {
					_createOrJoin(data);
					if (data.code == 200) {
						$("#startBtn").button("disable");
						$("#restartBtn").button("disable");
						$("#exitBtn").button("enable");
					} else if (data.code == 500) {
						$.mobile.changePage("#roomlist", {
							changeHash: true
						});
					}
				}
			);

		}
	}


	$("#loginBtn").click(function() {
		channelId = $("#channels").val();
		roomtitle.innerHTML = $("#channels").find("option:selected").text();
		var un = $("#username").val();

		if (un != '') {
			if(un.replace(/(^s*)|(s*$)/g, "").length <=5){
							pomelo.request("gate.gateHandler.queryEntry", {
					channelId: channelId
				},
				function(queryData) {
					connectHost = queryData.host;
					connectPort = queryData.port;
					pomelo.disconnect();
					pomelo.init({
							host: queryData.host,
							port: queryData.port,
							log: true
						},
						function() {
							if (queryData.code == 200) {
								login(channelId, un);
							} else {
								alert(queryData.msg);
							}
						});
				});
			}
			else{
				alert("用户名不能超过5个字符");
			}

		} else {
			alert("用户名不能为空");
		}

	});

	$("#joinBtn").click(function() {
		createOrJoin();
	});

	$("#startBtn").click(function() {
		pomelo.request("chess.chessHandler.begin", {
				room: room
			},
			function(data) {
				startGame();
			});
	});

	$("#restartBtn").click(function() {
		pomelo.request("chess.chessHandler.reset", {
				room: room
			},
			function(data) {});
	});

	$("#exitBtn").click(function() {
		exitGame();
		room = -20130820;
		$.mobile.changePage("#roomlist", {
			changeHash: true
		});
	});
});