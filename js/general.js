var passwordemptystring = "****************";
var editorvalues;
var _ajaxcom;
function loaded() {
	//
	$(".rightcornermenu_close").hover(function() {
		$(".rightcornermenu_auto").addClass("rightcornermenu_open");
		$(this).addClass("rightcornermenu_open");
	}, function() {
		$(".rightcornermenu_auto").removeClass("rightcornermenu_open");
		$(this).removeClass("rightcornermenu_open");
	});
	_ajaxcom = new AJAXCom();
	// init all functions of the board
	// this will allways will be called if a statuscheck will be perfomed they
	// are performed after login logout and the saving
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
		renewmenu();
	};
	// set the Event which is called if the Datas are updated
	_ajaxcom.setEvent(eventparam);
	// call to update the data.
	_ajaxcom.updatedata();
	renewmenu();
}
function renewmenu(){
	var rest = "";
	if(_ajaxcom.getLoginState() == "1"){
		rest += "<li> <a href=\"#\" id=\"logout\">Logout</a></li>";
		$("#menu_headline").text("Menu(Logout)");
	}else{
		$("#menu_headline").text("Menu");	
	}	
	rest += "<li> <a href='#' id='reload_editor'>Startseite</a></li>";
	rest += "<li> <a href=\"#\" id=\"tutorial\">Turorial</a></li>";
	rest += "<li> <a href=\"#\" id=\"impressum\">Impressum</a></li>";
	$("#submenu").html(rest);
	
	if(_ajaxcom.getLoginState() == "1"){
		$("#logout").click(function() {
			_ajaxcom.logout();
		});	
	}
	$("#reload_editor").click(function(){
			if(_ajaxcom.getLoginState == "1"){
				_ajaxcom.getFieldScreen(function() {
					displayUsrEditor();
				});
			}else{
				$(".screen").html(centerFrame());
				$(".content").html(getLoginScreen());
				initLoginScreen();
			}
			
	});	
	$("#tutorial").click(function() {
		showTutorial();
	});
	$("#impressum").click(function() {
		showImpressum();
	});
}
function showTutorial() {
	$(".screen").html("<div class='impressum'> <h1> Tutorial </h1> </br> Url: <a href='http://stzedn.de/isl/organisation/wlananmeldung'> http://stzedn.de/isl/organisation/wlananmeldung  </a>  </div>");
}
function showImpressum(){
	$(".screen").html("<div class='impressum'><h1> Impressum </h1> </br> </br> <h2> Verwaltung</h2> </br> <p> Daniel Haß </p> <p> Lars Möllendorf </p><p> Marcel Hollerbach </p>"+
	"</br></br> <h2> Code </h2> <p>Marcel Hollerbach </p><p>Daniel Haß</p></div>"
	+"</br></br> Kontakt-Email:<a href='mailto:it@phaenovum.eu'>it@phaenovum.eu</a>");
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
	$(".screen").html("<div class='editor'> "+ htmlcode + '</div>');
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
	var result = displayname + '</br> <input type="text" id="' + aliashtmlname
			+ '" value="' + value + '" />' + flags;
	var flagkeywords = [ 'pw', 'ro' ];
	var flagfunctions = [
			function() {
				// password will not be transmitted so insert an static value 
				result = displayname
						+ '</br> <input  type="password" id="'
						+ aliashtmlname
						+ '-check1" value="'
						+ passwordemptystring
						+ '"\
	                    	 /><br> <input type="password" id="'
						+ aliashtmlname + '-check2" value="'
						+ passwordemptystring + '" />';
			},
			function() {
				result = displayname + '</br> <input type="text" id="'
						+ aliashtmlname + '" value="' + value + '" readonly />';
			} ];
	var numberflags = new Array();
	$.each(flagkeywords, function(key, possibleflag) {
		if (flags.indexOf(possibleflag) != -1) {
			flagfunctions[flagkeywords.indexOf(possibleflag)]();
		}
	});
	result = '<div class="seperator"></div><div class="fieldcontainer">' + result+"</div>";
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
	// disable logout
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
			_ajaxcom.sentData(attributes, function(msg) {
				_ajaxcom.getFieldScreen(function() {
					displayUsrEditor();
				});
			});
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
	// $(".msgbox").html(error);
}
/**
 * Will display an Message with Waiting icon
 * 
 * @param error
 */
function showWaitingMsg(message) {
	// TODO set the right image for the image div
	// $(".msgbox").html(message);
}
/**
 * Will display an Info Message
 * 
 * @param error
 */
function showInfoMsg(message) {
	// TODO set the right image for the image div
	// $(".msgbox").html(message);
}
