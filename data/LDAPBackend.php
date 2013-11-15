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
			//TODO settings flag for use tls or not
			if(Settings::getLDAPUseTLS()){
				ldap_start_tls($this->ldapcon)
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
	 * 	True on succes, NULL if the parameters where wrong, a String when the Bind itself fails
	 */
	public function bind($usr = NULL,$pw = NULL){
		if($pw != NULL && $usr != NULL){
			//build statement
			$dn = "uid=".$usr.",".Settings::getLDAPUserDirectory().
			",".Settings::getLDAPBaseDN();
			//bind with usr data
			$result = @ldap_bind($this ->ldapcon,$dn,$pw);
			if($result)
				return true;
			else
				return "Bind Failed : "+ldap_error($this ->ldapcon);
		}
		return NULL;
	}
	/**
	 * Modifys Userdata from a special User
	 *
	 * @param string $usr
	 * 		The uid of the User
	 * @param array $attribute the array of attributes you want to change
	 */
	public function modifyUsrFields($usr,$attribute){
		//modify the choosen field.
		$result = ldap_modify($this -> ldapcon,'uid='.$usr.",".
				Settings::getLDAPUserDirectory().",".Settings::getLDAPBaseDN(),
				$attribute);
		return $result;
	}
	/**
	 * get A special Ldap field from the User usr
	 * @param unknown $usr
	 * @param unknown $field
	 * @return NULL
	 */
	public function getUsrFields($usr,$field){
		$attribute = array($field);
		$result = ldap_search($this->ldapcon,Settings::getLDAPUserDirectory().",".
				Settings::getLDAPBaseDN(),'uid='.$usr,$attribute);
		$entry = ldap_get_entries($this->ldapcon, $result);
		$entry = $entry[0];
		if(isset($entry[$field])){
			if(is_array($entry[$field]))
				return $entry[$field][0];
			else
				return $entry[$field];
		}else{
			return null;
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
