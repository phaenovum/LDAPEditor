<?php
/**
 * Creates a
 * @param unknown $exotcode
 * @param string $errormsg
 */
function createAnswer($exitcode,$answer = null,$errormsg = null,$spectualcontent = false){
	//clean and end the buffer to ba able to say something !
	ob_end_clean();
	//start a new one !
	ob_start();
	//write the answer
	header('Content-type: text/xml');
	echo "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n";
	echo "<request>\n";
	echo "<status>";
	echo "<exitcode>".$exitcode."</exitcode>\n";
	if($errormsg != null){
		echo "<error>".$errormsg."</error>\n";
	}
	echo "</status>\n";
	echo "<answer>\n";
	if($spectualcontent){
		echo "<![CDATA[";
	}
	echo $answer;
	if($spectualcontent){
		echo "]]>";
	}
	echo"</answer>\n";
	echo "</request>\n";
	//end and flush the buffer !
	ob_end_flush();
	exit();
}
//test if the request is from a ajax request or not, if yes we will answer the request.
if(!isset($_SERVER['HTTP_X_REQUESTED_WITH']) || $_SERVER['HTTP_X_REQUESTED_WITH'] === 'XMLHttpRequest') {
	//starting the session
	session_start();
	//start muting all the outputs
	//ob_start();
	include './Session.php';
	$session = new Session();
	include './Settings.php';
	//test settings
	if(Settings::testFile() != TRUE){
		createAnswer("-1","",ob_get_contents());
		exit();
	}
	//Include Template Parser
	include './Template.php';
	$template = new Template();
	include './LDAPBackend.php';
	$ldapinstance = new LDAPBackend();
	if(!$ldapinstance->isCorrect()){
		createAnswer("-1","",ob_get_contents());
		exit();
	}
	switch($_POST['request']){
		case "portstate":
			if(!Session::getUser()){
				createAnswer("-1");
			}else{
				createAnswer("1",Session::getUser());
			}
			exit();
		case "login":
			$bind = $ldapinstance->bind(
			$_POST['user'],$_POST['password']);
			if($bind){
				$session -> setUser($_POST['user']);
				$session ->setPW($_POST['password']);
				createAnswer("1");
			}else{
				createAnswer("-1","","Login Failed");
			}
			exit();
		case "logout":
			$session -> setUser("");
			$session ->setPW("");
			$ldapinstance->logout();
			exit();
		case "displayUserData":
			$result = "<template>";
			foreach ($template->getAttributes() as $attribute){
				$result .= "<attribute>";
				$result .= $attribute ->getXMLContent();
				$result .= "<value>valueeeee</value>";
				$result .= "</attribute>";
			}
			$result .= "</template>";
			createAnswer("1",$result);
			exit();
		case "savedata":
			$newattributes = array();
			$templatearray = $template->getAttributes();
			foreach ($_POST['data'] as $attribute){
				if(isset($templatearray[$attribute['ldapname']])){
					//looks good
					$newattributes[$attribute['ldapname']] = $attribute['newvalue'];
				}
			}
			//TODO give the array to the ldap backend
			break;
	}
	ob_end_clean();
}
?>