var passwordemptystring = "****************";
var editorvalues;
function loaded() {
	// init effects
	$("#icons li").hover(function() {
		$(this).addClass("ui-state-hover");
	}, function() {
		$(this).removeClass("ui-state-hover");
	});
	// wait that you know that a user is logged in or not
	_ajaxcom = new AJAXCom();
	// init all functions of the board
	var eventparam = function() {
		// what to do if there is new data
		// if a user is logged in refresh the sidebar
		if (_ajaxcom.getLoginState() == "1") {
			// user logged in
			showInfoMsg("Hallo " + _ajaxcom.getUsrName());
			_ajaxcom.getFieldScreen(function() {
				displayUsrEditor();
			});
		} else {
			// no user is logged in
			$(".screen").html(centerFrame());
			$(".content").html(getLoginScreen());
			initLoginScreen();
		}
	};
	// set the Event which is called if the Datas are updated
	_ajaxcom.setEvent(eventparam);
	// call to update the data.
	_ajaxcom.updatedata();
	$(".logoutbtn").click(function() {
		_ajaxcom.logout();
	});
}
/**
 * This will display the User Editor
 */
function displayUsrEditor() {
	var htmlcode = "";
	$.each(_ajaxcom.getAttributes(), function(key, attribute) {
		htmlcode += getField(attribute.aliashtmlname, attribute.displayname,
				attribute.descirption, attribute.flags, attribute.value)
				+ "<br>";
	});
	htmlcode += getUpdateButton();
	$(".screen").html("<div class='editor'>"+htmlcode+'</div>');
	initUpdateButton(0);
}
/**
 * Will return the HTML Code for the Update Screen
 * 
 * @returns {String}
 */
function displayUpdateScreen() {
	var result = "";
	var display = true;
	$.each(_ajaxcom.getAttributes(),
			function(key, attribute) {
				if (attribute.readonly == false) {
					// get newest value if it isnt a readonly field
					var value = $("#" + attribute.aliashtmlname).val();
					var originaldata = attribute.value;
					if (attribute.password == true) {
						value = $("#" + attribute.aliashtmlname + "-check1")
								.val();
						originaldata = passwordemptystring;
					}
					if (value != originaldata && attribute.readonly == false) {
						if (attribute.password == true) {
							if ($("#" + attribute.aliashtmlname + "-check1")
									.val() == $(
									"#" + attribute.aliashtmlname + "-check2")
									.val()) {
								result += attribute.aliashtmlname
										+ " Changed <br>";
							} else {
								alert("Nicht Übereinstimmende Passwörter!");
								displayUsrEditor();
								display = false;
							}

						} else {
							result += attribute.displayname + " "
									+ attribute.value + " "
									+ $("#" + attribute.aliashtmlname).val()
									+ "<br>";
						}
						attribute.newvalue = value;
					}
				}
			});
	if (result == "") {
		result = "Keine Änderungen !"
	}
	if (display) {
		$(".screen")
				.html(result + "<br>" + getBackButton() + getUpdateButton());
		initUpdateButton(1);
		initBackButton();
	}
}
/**
 * Will return the Correct form of the fields depending on the flags.
 * 
 * @param ldapname
 * @param displayname
 * @param description
 * @param flags
 * @param value
 * @returns {String}
 */
function getField(aliashtmlname, displayname, description, flags, value) {
	var result = displayname + ': <input type="text" id="' + aliashtmlname
			+ '" value="' + value + '" />' + flags;
	var flagkeywords = [ 'pw', 'ro' ];
	var flagfunctions = [
			function() {
				// password will not be transmitted
				result = displayname
						+ ': <input  type="password" id="'
						+ aliashtmlname
						+ '-check1" value="'
						+ passwordemptystring
						+ '"\
	                    	 /><br> Wiederholung : <input type="password" id="'
						+ aliashtmlname + '-check2" value="'
						+ passwordemptystring + '" />';
			},
			function() {
				result = displayname + ': <input type="text" id="'
						+ aliashtmlname + '" value="' + value + '" readonly />';
			} ];
	var numberflags = new Array();
	$.each(flagkeywords, function(key, possibleflag) {
		if (flags.indexOf(possibleflag) != -1) {
			flagfunctions[flagkeywords.indexOf(possibleflag)]();
		}
	});
	result = '<div class="seperator"></div>' + result;
	return result;
}
/**
 * Will return the Login Screen.
 * 
 * @returns
 */
function getLoginScreen() {
	return 'Username: <input id="usrname" type="text" name="pw" /> </br>\
	Password: <input id="usrpw" type="password" name="pw" />\
	<br> <input id="loginbtn" type="submit" value="Login">';
}
/**
 * Will init the Loginscreen
 * 
 * @returns
 */
function initLoginScreen() {
	$('#loginbtn').click(function() {
		_ajaxcom.login($('#usrname').val(), $('#usrpw').val());
	});
}
/**
 * Will return the HTML Code. The middle place can be called by the class
 * content
 * 
 * @returns
 */
function centerFrame() {
	return '<div class="content_background"></div><div class="content"></div>';
}
/**
 * Will return the Back button
 * 
 * @returns
 */
function getBackButton() {
	return '<input id="backbtn" type="submit" value="Back">';
}
/**
 * Will init the Back Button
 * 
 * @returns
 */
function initBackButton() {
	$('#backbtn').click(function() {
		displayUsrEditor();
	});
}
/**
 * Will return the Update Button
 * 
 * @returns
 */
function getUpdateButton() {
	return '<input id="updatebtn" type="submit" value="Update">';
}
/**
 * Will init the Update Button
 * 
 * @param phase
 *            if 0 the click will display the Update Screen if 1 it will sent
 *            the data to the ldapserver.
 */
function initUpdateButton(phase) {
	if (phase == 0) {
		// link to the Update site
		$('#updatebtn').click(function() {
			displayUpdateScreen();
		});
	} else {
		// link to sent the data to the ldap account.
		$('#updatebtn').click(function() {
			var attributes = [];
			var counter = 0;
			$.each(_ajaxcom.getAttributes(), function(key, attribute) {
				if (attribute.newvalue != "") {
					attributes[counter] = attribute;
					counter++;
				}
			});
			_ajaxcom.sentData(attributes);
		});
	}
}
/**
 * Will display an Errormessage
 * 
 * @param error
 */
function showErrorMsg(error) {
	// TODO set the right image for the image div
	$(".msgbox").html(error);
}
/**
 * Will display an Message with Waiting icon
 * 
 * @param error
 */
function showWaitingMsg(message) {
	// TODO set the right image for the image div
	$(".msgbox").html(message);
}
/**
 * Will display an Info Message
 * 
 * @param error
 */
function showInfoMsg(message) {
	// TODO set the right image for the image div
	$(".msgbox").html(message);
}