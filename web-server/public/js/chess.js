var iBox;
var iArray;
var mouseBox;
var num = 15;
var pad = 5;
var screenwidth = window.innerWidth - 2 * pad;
var width = Math.floor(screenwidth / num);
var chesssize = Math.floor(0.8 * width);
function addClass(object, className) {
	var classString;
	if (document.all)
		classString = object.getAttribute("className");
	else
		classString = object.getAttribute("class");
	if (classString == null) {
		if (document.all)
			object.setAttribute("className", className);
		else
			object.setAttribute("class", className);
	} else {
		classString += " " + className;
		if (document.all)
			object.setAttribute("className", classString);
		else
			object.setAttribute("class", classString);
	}
}

function removeClass(object, className) {
	var classString;
	if (document.all)
		classString = object.getAttribute("className");
	else
		classString = object.getAttribute("class");
	if (classString == null)
		return false;
	var classArray = classString.split(" ");
	for ( var i = 0; i < classArray.length; i++) {
		if (classArray[i] != className)
			continue;
		else {
			classArray.splice(i, 1);
		}
	}
	classString = classArray.join(" ");
	if (document.all)
		object.setAttribute("className", classString);
	else
		object.setAttribute("class", classString);
}

function getElementsByClassName(className, root) {
	var list = new Array();
	var temClass;
	if (!root)
		root = document.body;
	var array = root.getElementsByTagName("*");
	for ( var i = 0; i < array.length; i++) {
		if (document.all)
			temClass = array[i].getAttribute("className");
		else
			temClass = array[i].getAttribute("class");
		if (temClass == null)
			continue;
		var temList = temClass.split(" ");
		for ( var j = 0; j < temList.length; j++) {
			if (temList[j] == className) {
				list.push(array[i]);
			}
		}
	}
	return list;
}

function repeatCheck(checkList) {
	for ( var i = 0; i < checkList.length; i++)
		for ( var j = i + 1; j < checkList.length; j++)
			if (checkList[i] === checkList[j])
				checkList.splice(j, 1);
	return checkList;
}

function getElement(string, rootArray) {
	if (!rootArray) {
		rootArray = new Array();
		rootArray[0] = document.body;
	}
	var temArray = string.split(" ");
	if (temArray.length == 1) {
		var returnList = new Array();
		string = temArray[0];
		while (rootArray.length) {
			if (string.match(/^\#{1}/)) {
				var temId = string.replace(/^\#{1}/, "");
				returnList.push(document.getElementById(temId));
			} else if (string.match(/^\.{1}/)) {
				var temClass = string.replace(/^\.{1}/, "");
				var classList = getElementsByClassName(temClass, rootArray[0]);
				for ( var i = 0; i < classList.length; i++) {
					returnList.push(classList[i]);
				}
			} else {
				var obj = rootArray[0].getElementsByTagName(string);
				if (obj)
					for ( var i = 0; i < obj.length; i++)
						returnList.push(obj[i]);
			}
			rootArray.shift();
		}

		return repeatCheck(returnList);
	} else {
		var childArray = new Array();
		for ( var i = 0; i < rootArray.length; i++) {
			var arr = new Array(rootArray[i]);
			childArray = childArray.concat(getElement(temArray[0], arr));
		}
		if (temArray.length > 1) {
			temArray.shift();
			string = temArray.join(" ");
			return getElement(string, childArray);
		}
	}
}
function adjustToScreen() {
	var chessboard1 = document.getElementById("chessboard1");
	chessboard1.style.width = screenwidth - 4 + "px";
	chessboard1.style.height = screenwidth - 4 + "px";
	chessboard1.style.padding = pad + "px";
	var pieceb = document.getElementById("pieceb");
	var piecew = document.getElementById("piecew");
	var blackPlay = document.getElementById("blackPlay");
	var whitePlay = document.getElementById("whitePlay");
	var blackName = document.getElementById("blackName");
	var whiteName = document.getElementById("whiteName");

	pieceb.style.top = screenwidth + 0.20 * screenwidth + "px";
	pieceb.style.right = "65%";
	piecew.style.top = screenwidth + 0.20 * screenwidth + "px";
	piecew.style.right = "15%";
	blackPlay.style.top = screenwidth + 0.22 * screenwidth + "px";
	blackPlay.style.right = "55%";
	whitePlay.style.top = screenwidth + 0.22 * screenwidth + "px";
	whitePlay.style.right = "5%";
	blackName.style.top = screenwidth + 0.22 * screenwidth + "px";
	blackName.style.right = "72%";
	whiteName.style.top = screenwidth + 0.22 * screenwidth + "px";
	whiteName.style.right = "22%"
	var sheet = document.styleSheets[2];
	var rules = sheet.cssRules || sheet.rules;

	var chessboard_bg_rule = rules[9];
	chessboard_bg_rule.style.left = pad + Math.floor(width / 2) + "px";
	chessboard_bg_rule.style.top = pad + Math.floor(width / 2) + "px";

	var chessboard_bg_td_rule = rules[10];
	chessboard_bg_td_rule.style.width = width - 1 + "px";
	chessboard_bg_td_rule.style.height = width - 1 + "px";

	var iBox_rule = rules[11];
	iBox_rule.style.width = num * width + "px";
	iBox_rule.style.height = num * width + "px";

	var iBox_i_rule = rules[12];
	iBox_i_rule.style.width = width + "px";
	iBox_i_rule.style.height = width + "px";

	var mouseBox_rule = rules[13];
	mouseBox_rule.style.height = width + "px";
	mouseBox_rule.style.width = width + "px";

	var piece_rule = rules[4];
	piece_rule.style.height = piece_rule.style.width = chesssize + "px";

	var piece_i_rule = rules[5];
	piece_i_rule.style.width = piece_i_rule.style.height = chesssize - 1 + "px";

	var chessboard_after_rule = rules[29];
	chessboard_after_rule.style.width = chessboard_after_rule.style.height = screenwidth
			+ 2 * pad + "px";

	var chessboard_bg_td_after = rules[30];
	chessboard_bg_td_after.style.width = chessboard_bg_td_after.style.height = width
			+ "px";

}

function createMap() {
	var chessboard = document.createElement("table");
	iArray = new Array();
	chessboard.className = "chessboard_bg";
	chessboard.cellPadding = 0;
	chessboard.cellSpacing = 0;
	var row, cell;
	for ( var i = 0; i < 14; i++) {
		row = chessboard.insertRow(-1);
		for ( var j = 0; j < 14; j++) {
			cell = row.insertCell(-1);
			cell.innerHTML = i + "*" + j;
		}
	}
	iBox = document.createElement("div");
	iBox.className = "iBox";
	for ( var i = 0; i < 15; i++)
		for ( var j = 0; j < 15; j++) {
			var iObj = document.createElement("i");
			iObj.appendChild(document.createTextNode(i * 15 + j));
			iObj.style.left = j * width + 1 + "px";
			iObj.style.top = i * width + 1 + "px";
			iBox.appendChild(iObj);
			iArray.push(iObj);
		}

	chessboardBox.appendChild(chessboard);
	chessboardBox.appendChild(iBox);
	console.log("ok");
}

function setPiece(index, role) {
	createPiece(iArray[index], role);
	mouseOverTips(iArray[index]);
	iArray[index].onclick = null;
}

function bindEvent() {
	for ( var i = 0; i < iArray.length; i++) {
		iArray[i].index = i;
		iArray[i].oncontextmenu = function() {
			return false;
		}

		iArray[i].onclick = function(e) {
			playChess(this.index);
		}

		iArray[i].onmouseover = function() {
			 mouseOverTips(iArray[this.index]);
		}
		iArray[i].onmouseout = function() {
			clearTips(iArray[this.index]);
		}
	}
}

function unbindEvent() {
	for ( var i = 0; i < iArray.length; i++) {
		iArray[i].onclick = null;
		iArray[i].onmouseover = null;
		iArray[i].onmouseout = null;
	}
}

function createPiece(obj, num) {
	var objLeft = parseInt(obj.style.left);
	var objTop = parseInt(obj.style.top);
	var pieceObj = document.createElement("div");

	addClass(pieceObj, "piece");
	if (num == 'host') {
		addClass(pieceObj, "black");
	} else if (num == 'guest') {
		addClass(pieceObj, "white");
	}

	pieceObj.style.left = objLeft + pad + "px";
	pieceObj.style.top = objTop + pad + "px";

	pieceObj.appendChild(document.createElement("i"));
	pieceBox.appendChild(pieceObj);
}

function mouseOverTips(obj) {
	var objLeft = parseInt(obj.style.left);
	var objTop = parseInt(obj.style.top);
	if (!mouseBox) {
		mouseBox = document.createElement("div");
		addClass(mouseBox, "mouseBox");
		for ( var i = 0; i < 4; i++) {
			var iObj = document.createElement("i");
			addClass(iObj, "mouseP");
			switch (i) {
			case 0:
				addClass(iObj, "mouseLT");
				break;
			case 1:
				addClass(iObj, "mouseRT");
				break;
			case 2:
				addClass(iObj, "mouseLB");
				break;
			case 3:
				addClass(iObj, "mouseRB");
				break;
			default:
				break;
			}
			mouseBox.appendChild(iObj);
		}
		chessboardBox.appendChild(mouseBox);
	}
	mouseBox.style.display = "block";
	mouseBox.style.left = objLeft + pad + "px";
	mouseBox.style.top = objTop + pad + "px";
}

function clearTips() {
	mouseBox.style.display = "none";
}