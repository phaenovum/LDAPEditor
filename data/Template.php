<?php
define("template_file","../config/settings.ini");
/**
 * A Class to handle the Template File
 * @author Marcel Hollerbach
 *
*/
class Template {
	//array for the fields in the xml file
	private $attributes;
	//the raw text from the xmlfile
	private $text;
	/**
	 * Will read in the xml template file.
	 */
	function __construct(){
		//read in the template.xml file
		$this ->text = file_get_contents('../config/template.xml');
		$templatearray = self::XMLtoArray($this ->text);
		$this -> attributes = array();
		foreach ($templatearray['TEMPLATE']['ATTRIBUTE'] as $attribute){
			$flagstring = "";
			if(isset($attribute['FLAGS']))
				$flagstring = $attribute['FLAGS'];
			$this -> attributes[$attribute['LDAPNAME']] = new Attribute($attribute['LDAPNAME'], $attribute['ALIASHTMLNAME'], $attribute['DISPLAYNAME'],
					$flagstring, $attribute['DESCRIPTION']);
		}
	}
	/**
	 * Will return the array with the parsed array
	 * @return Type:Array Will return an Array with objects of the type Attribute
	 */
	function getAttributes(){
		return $this -> attributes;
	}
	/**
	 * Returns the raw data of the template.xml
	 * @return string
	 */
	function getXMLRawData(){
		return $this->text;
	}
	/**
	 * Will return true if everything is okay with the file otherwise not
	 */
	static function testTemplate(){
		if(file_exists(template_file)&&is_readable(template_file))
			return true;
		else{
			echo "Exists : ".file_exists(template_file)."\n";
			echo "Is Readable : ".is_readable(template_file)."\n";
		}
	}
	/**
	 * Parses the given string for String
	 * @param string $XML
	 * @return array
	 */
	static function XMLtoArray($XML)
	{
		$xml_parser = xml_parser_create();
		xml_parse_into_struct($xml_parser, $XML, $vals);
		xml_parser_free($xml_parser);
		$_tmp='';
		foreach ($vals as $xml_elem) {
			$x_tag=$xml_elem['tag'];
			$x_level=$xml_elem['level'];
			$x_type=$xml_elem['type'];
			if ($x_level!=1 && $x_type == 'close') {
				if (isset($multi_key[$x_tag][$x_level]))
					$multi_key[$x_tag][$x_level]=1;
				else
					$multi_key[$x_tag][$x_level]=0;
			}
			if ($x_level!=1 && $x_type == 'complete') {
				if ($_tmp==$x_tag)
					$multi_key[$x_tag][$x_level]=1;
				$_tmp=$x_tag;
			}
		}
		foreach ($vals as $xml_elem) {
			$x_tag=$xml_elem['tag'];
			$x_level=$xml_elem['level'];
			$x_type=$xml_elem['type'];
			if ($x_type == 'open')
				$level[$x_level] = $x_tag;
			$start_level = 1;
			$php_stmt = '$xml_array';
			if ($x_type=='close' && $x_level!=1)
				$multi_key[$x_tag][$x_level]++;
			while ($start_level < $x_level) {
				$php_stmt .= '[$level['.$start_level.']]';
				if (isset($multi_key[$level[$start_level]][$start_level]) && $multi_key[$level[$start_level]][$start_level])
					$php_stmt .= '['.($multi_key[$level[$start_level]][$start_level]-1).']';
				$start_level++;
			}
			$add='';
			if (isset($multi_key[$x_tag][$x_level]) && $multi_key[$x_tag][$x_level] && ($x_type=='open' || $x_type=='complete')) {
				if (!isset($multi_key2[$x_tag][$x_level]))
					$multi_key2[$x_tag][$x_level]=0;
				else
					$multi_key2[$x_tag][$x_level]++;
				$add='['.$multi_key2[$x_tag][$x_level].']';
			}
			if (isset($xml_elem['value']) && trim($xml_elem['value'])!='' && !array_key_exists('attributes', $xml_elem)) {
				if ($x_type == 'open')
					$php_stmt_main=$php_stmt.'[$x_type]'.$add.'[\'content\'] = $xml_elem[\'value\'];';
				else
					$php_stmt_main=$php_stmt.'[$x_tag]'.$add.' = $xml_elem[\'value\'];';
				eval($php_stmt_main);
			}
			if (array_key_exists('attributes', $xml_elem)) {
				if (isset($xml_elem['value'])) {
					$php_stmt_main=$php_stmt.'[$x_tag]'.$add.'[\'content\'] = $xml_elem[\'value\'];';
					eval($php_stmt_main);
				}
				foreach ($xml_elem['attributes'] as $key=>$value) {
					$php_stmt_att=$php_stmt.'[$x_tag]'.$add.'[$key] = $value;';
					eval($php_stmt_att);
				}
			}
		}
		return $xml_array;
	}
}
/**
 * A Class to represent the Attributes which should be shown.
 * @author Marcel Hollerbach
 *
 */
class Attribute {
	private $data;
	private $flagsarray = array("pw","ro","sh");
	function __construct($ldapname,$htmlalias,$displayname,$flags,$description){
		$this -> data = array();
		$this ->data['ldapname'] = $ldapname;
		$this ->data['displayname'] = $displayname;
		$this ->data['flags'] = $flags;
		foreach ($this->flagsarray as $flagarray){
			if(strpos($flags,$flagarray) === false){
				$this ->data[$flagarray] = FALSE;
			}else{
				$this ->data[$flagarray] = TRUE;
			}
		}
		$this ->data['description'] = $description;
		$this ->data['aliashtmlname'] = $htmlalias;
	}
	function getLDAPName(){
		return $this ->data['ldapname'];
	}
	function getDisplayName(){
		return $this ->data['displayname'];
	}
	function getFlags(){
		return $this ->data['flags'];
	}
	function isPw(){
		return $this ->data['pw'];
	}
	function isRo(){
		return $this ->data['ro'];
	}
	function isSh(){
		return $this ->data['sh'];
	}
	function getDescription(){
		return $this ->data['description'];
	}
	/**
	 * Will return the content of this object in xml style
	 * @return string
	 */
	function getXMLContent(){
		$result = "";
		foreach ($this ->data as $key => $value){
			$use = true;
			foreach ($this->flagsarray as $possibleflag){
				if($key == $possibleflag)
					$use = false;
			}
			if($use)
				$result .= "<$key>$value</$key>\n";
		}
		return $result;
	}
}
?>