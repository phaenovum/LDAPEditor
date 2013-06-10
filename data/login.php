<?php
if(isset($_POST['request'])&&$_POST['request'] != 'pagerequ')
	die();

?>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
</head>
<body>
	<form name="loginform" id="loginform">
		<input type="hidden" name="request" value="login" /> <br> User:<input
			id="usrname" type="text" name="user" /> <br> Password: <input
			id="usrpw" type="password" name="pw" /><br> <input id="loginbtn"
			type="submit" value="Login">
	</form>
</body>
</html>
