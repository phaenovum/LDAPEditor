<?php
define("config_file","../../config/settings.ini");
/**
 * A Class to handle the Settings
 * @author marcel
 *
*/
class Settings {
	public static function testFile() {
		if(file_exists(config_file)&&is_readable(config_file))
			return true;
		else{
			echo "Exists : ".file_exists(config_file)."\n";
			echo "Is Readable : ".is_readable(config_file)."\n";
		}

	}
	public static function getLDAPServer() {
		$ini = parse_ini_file(config_file);
		return $ini['ldap-server'];
	}
	public static function getLDAPUserDirectory() {
		$ini = parse_ini_file(config_file);
		return $ini['ldap-usr-group'];
	}
	public static function getLDAPBaseDN() {
		$ini = parse_ini_file(config_file);
		return $ini['ldap-base-dn'];
	}
}
?>
