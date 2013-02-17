<?php
/**
 *
 * @author marcel
 */
class LDAPBackend {
	private $ldapcon;
	public function __construct(){
		//ckecking if host is up
		if($fp = @(fsockopen(Settings::getLDAPServer(),389,$errCode,$errStr,1))){
			fclose($fp);
			//Open Connection
			$this->ldapcon = ldap_connect(Settings::getLDAPServer());
			//Set Protocol type for openldap
			ldap_set_option($this->ldapcon, LDAP_OPT_PROTOCOL_VERSION, 3);
			if(!$this ->ldapcon){
				echo "Fatal Error: LDAP Server nicht erreichbar";
				echo "reason: ".ldap_error($this -> ldapcon);
			}
		} else{
			echo "Fatal Error: LDAP Server nicht erreichbar";
			echo "readson: Host is Down ";
			$this->ldapcon = false;
		}
	}
	function isCorrect(){
		if(!$this -> ldapcon)
			return false;
		else
			return true;
	}
	/**
	 * Will bind an User in the ldap Directory
	 * @param string $usr
	 * @param string $pw
	 * @return boolean
	 * 	True on succes, False on Failer
	 */
	public function bind($usr = NULL,$pw = NULL){
		if($pw != NULL && $usr != NULL){
			//build statement
			if($usr == 'admin'){
				$dn = "cn=admin,".Settings::getLDAPBaseDN();
			}else{
				$dn = "uid=".$usr.",".Settings::getLDAPUserDirectory().
				",".Settings::getLDAPBaseDN();
			}
			//bind with usr data
			$result = @ldap_bind($this ->ldapcon,$dn,$pw);
		}else{
			//annonym bind
			$result = @ldap_bind($this ->ldapcon);
		}
		return $result;
	}
	/**
	 * Modifys Userdata from a special User
	 *
	 * @param unknown $usr
	 * 		The uid of the User
	 * @param unknown $pw
	 * 		The valid Passwort
	 * @param unknown $field
	 *
	 * @param unknown $new value
	 * 		The new value of the field
	 */
	public function modifyUsrFields($usr,$attribute){
		//modify the choosen field.
		$usrname = $this -> getUsrFields($usr, 'cn')[0];
		$result = ldap_modify($this -> ldapcon,'cn='.$usrname.",".
				Settings::getLDAPUserDirectory().",".Settings::getLDAPBaseDN(),
				$attribute);
		//if the result is not false the modify was succesful
		if(!$result){
			return FALSE;
		}
	}
	/**
	 * get A special Ldap field from the User usr
	 * @param unknown $usr
	 * @param unknown $field
	 * @return NULL
	 */
	public function getUsrFields($usr,$field){
		$attribute = array($field,'objectclass');
		//TODO Test
		//search field
		$result = ldap_search($this->ldapcon,Settings::getLDAPUserDirectory().",".Settings::getLDAPBaseDN(),'uid='.$usr,$attribute);
		//look for an error
		if(!$result){
			return FALSE;
		}
		//read out the field datas
		$entry = ldap_get_entries($this->ldapcon, $result);
		$found = false;
		$values = $entry[0];
		foreach($values['objectclass'] as $classname){
			if($classname == 'bashAccount'){
				$found = true;
				break;
			}
		}

		if($found){
			if(isset($entry[0][$field])){
				//field was not found
				return $entry[0][$field];
			}
			//field was found
			return FALSE;
		}else{
			return FALSE;
		}
	}
	/**
	 * Returns an Array with the names of all the Users.
	 * @return multitype:NULL
	 */
	public function getAllUsers(){
		$result = ldap_search($this->ldapcon,Settings::getLDAPUserDirectory().",".Settings::getLDAPBaseDN(),'cn=*');
		$entry = ldap_get_entries($this->ldapcon, $result);
		$names = array();
		foreach($entry as $user){
			$names[] = $user['uid'][0];
		}
		return $names;
	}
	/**
	 * Close Connection to the LDAP-Server
	 */
	function logout(){
		ldap_close($this->ldapcon);
	}
}