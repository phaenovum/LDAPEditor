function AJAXCom() {
	var param;
	var errormsg = null;
	var status = null;
	var usrname = null;
	var attributes = null;
	this.sentData = sentData;
	this.updatedata = updateData;
	this.setEvent = setevent;
	this.login = login;
	this.logout = logout;
	this.getAttributes = function() {
		return attributes;
	}
	this.getFieldScreen = getFieldScreen;

	this.getLoginState = function getstate() {
		return status;
	};

	this.getUsrName = function getUsrName() {
		return usrname;
	};
	/**
	 * Will transmit this data to the backend.
	 * 
	 * @param attributes
	 *            The attriutes to transmit
	 * @param event
	 *            This function is called when the call is finished.
	 */
	function sentData(attributes, event) {
		$.ajax({
			type : "POST",
			url : "./data/backindex.php",
			datatyp : "xml",
			data : {
				request : "savedata",
				data : attributes
			}
		}).done(function(msg) {
			event(msg);
			updateData();
		});
	}
	/**
	 * Set the Master Event which will be called when the status changed.
	 * 
	 * @param paramarg
	 */
	function setevent(paramarg) {
		param = paramarg;
	}
	/**
	 * Will update the Data
	 */
	function updateData() {
		showWaitingMsg("Query Backend");
		$.ajax({
			type : "POST",
			url : "./data/backindex.php",
			datatyp : "xml",
			data : {
				request : "portstate"
			}
		}).done(function(msg) {
			// alert("updatedata");
			var exitcode = $(msg).find("exitcode").text();
			status = exitcode;
			if (exitcode == "1") {
				usrname = $(msg).find("answer").text();
			} else {
				usrname = null;
				var error = $(msg).find("error").text();
				if (error != null && error != "")
					showErrorMsg($(msg).find("error").text());
			}
			param();
		});
	}
	/**
	 * Will login a user. At the end update the Master Event will be called.
	 * 
	 * @param usr
	 * @param pw
	 */
	function login(usr, pw) {
		$.ajax({
			type : "POST",
			url : "./data/backindex.php",
			datatyp : "xml",
			data : {
				request : "login",
				user : usr,
				password : pw,
			}
		}).done(function(msg) {
			var exitcode = $(msg).find("exitcode").text();
			if (exitcode == "-1") {
				showErrorMsg("Login Fehlgeschlagen.");
			} else {
				showInfoMsg("Erfolgreich eingeloggt.");
			}
			updateData();
		});
	}
	/**
	 * This will log out hte logedin user.
	 */
	function logout() {
		$.ajax({
			type : "POST",
			url : "./data/backindex.php",
			datatyp : "xml",
			data : {
				request : "logout"
			}
		}).done(function(msg) {
			showInfoMsg("Logout erfolgreich.");
			updateData();
		});
	}
	function getFieldScreen(event) {
		$.ajax({
			type : "POST",
			url : "./data/backindex.php",
			datatyp : "xml",
			data : {
				request : "displayUserData"
			}
		}).done(function(msg) {
			var htmlcode = "";
			attributes = new Array();
			$(msg).find('template').children().each(function() {
				var flagkeywords = [ 'pw', 'ro' ];
				var flags = $(this).find("flags").text();
				var password = false;
				var readonly = false;
				$.each(flagkeywords, function(key, possibleflag) {
					if (flags.indexOf(possibleflag) != -1) {
						if (key == 0) {
							password = true;
						} else if (key == 1) {
							readonly = true;
						}
					}
				});
				attributes[attributes.length] = {
					ldapname : $(this).find("ldapname").text(),
					displayname : $(this).find("displayname").text(),
					description : $(this).find("description").text(),
					aliashtmlname : $(this).find("aliashtmlname").text(),
					flags : flags,
					password : password,
					readonly : readonly,
					newvalue : "",
					value : $(this).find("value").text()
				}
			});
			event();
		});
	}

}