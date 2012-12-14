<?php
	$db = new mysqli("localhost", "devhints", "1234", "devhints");

	function update_page($id, $json){
		global $db;
		
		$query = $db->prepare("UPDATE dh_pages SET data=? WHERE id = ?;");
		$query->bind_param("si", $json, $id);
		$query->execute();
		$changes = $query->affected_rows;
		$query->close();
		
		return $changes > 0;
	}
	
	function update_block($id, $json){
		global $db;
		
		$query = $db->prepare("UPDATE dh_blocks SET data=? WHERE id = ?;");
		$query->bind_param("si", $json, $id);
		$query->execute();
		$changes = $query->affected_rows;
		$query->close();
		
		return $changes > 0;
	}
	
	function update_item($id, $json){
		global $db;
		
		$query = $db->prepare("UPDATE dh_items SET data=? WHERE id = ?;");
		$query->bind_param("si", $json, $id);
		$query->execute();
		$changes = $query->affected_rows;
		$query->close();
		
		return $changes > 0;
	}
	
	function add_page($json){
		global $db;
		
		$query = $db->prepare("INSERT INTO dh_pages SET data=?;");
		$query->bind_param("s", $json);
		$query->execute();
		$query->close();
		
		return $db->insert_id;
	}
	
	function add_block($json){
		global $db;
		
		$query = $db->prepare("INSERT INTO dh_blocks SET data=?;");
		$query->bind_param("s", $json);
		$query->execute();
		$query->close();
		
		return $db->insert_id;
	}
	
	function add_item($json){
		global $db;
		
		$query = $db->prepare("INSERT INTO dh_items SET data=?;");
		$query->bind_param("s", $json);
		$query->execute();
		$query->close();
		
		return $db->insert_id;
	}
	
	
	$type = $_GET["type"];
	$mode = $_SERVER["REQUEST_METHOD"];
	$ret = null;
	$id = null;
	$data = null;
	if($mode=="PUT"){
		$data = json_decode(file_get_contents("php://input"));
	}
	else{
		$data = json_decode($_POST);
	}
	if($mode=="POST") $id = $data['dbid'];
	$json = json_encode($data);
	
	switch($type){
		case "page":
			if($mode=="PUT") $ret = add_page($json);
			if($mode=="POST") $ret = update_page($id, $json);
			break;
		case "block":
			if($mode=="PUT") $ret = add_block($json);
			if($mode=="POST") $ret = update_block($id, $json);
			break;
		case "item":
			if($mode=="PUT") $ret = add_item($json);
			if($mode=="POST") $ret = update_item($id, $json);
			break;
	}
	
	echo json_encode(array('return' => $ret));
?>