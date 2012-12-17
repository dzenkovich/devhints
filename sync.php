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
	
	function get_pages(){
		global $db;
		
		$pages = array();
		$res = $db->query("SELECT * FROM dh_pages;");
		$rows = $res->fetch_all(MYSQLI_ASSOC);
		for($i=0; $i<count($rows); $i++){
			$page = json_decode($rows[$i]['data']);
			$page->dbid = $rows[$i]['id'];
			array_push($pages, $page);
		}
		
		return $pages;
	}
	
	function get_blocks($page_id){
		global $db;
		
		$query = $db->prepare("SELECT * FROM dh_blocks WHERE page_id=?;");
		$query->bind_param("i", $page_id);
		$res = $query->execute();
		$query->close();
		
		return $res->fetch_all(MYSQLI_ASSOC);
	}
	
	function get_items($block_id){
		global $db;
		
		$query = $db->prepare("SELECT * FROM dh_items WHERE block_id=?;");
		$query->bind_param("i", $block_id);
		$res = $query->execute();
		$query->close();
		
		return $res->fetch_all(MYSQLI_ASSOC);
	}
	
	$type = $_GET["type"];
	$mode = $_SERVER["REQUEST_METHOD"];
	$ret = null;
	$id = null;
	$data = null;
	$slug = null;
	
	if($mode=="PUT"){
		$data = json_decode(file_get_contents("php://input"));
	}
	elseif($mode == "POST"){
		$data = json_decode($_POST);
	}
	if($mode=="POST") $id = $data['dbid'];
	if($data) $json = json_encode($data);
	$parts = explode("/", $_SERVER["REQUEST_URI"]);
	$slug = array_pop($parts);
	$slug = in_array($slug, array('page', 'block', 'item'))?null:$slug;
	
	switch($type){
		case "page":
			if($mode=="PUT") $ret = add_page($json);
			if($mode=="POST") $ret = update_page($id, $json);
			if($mode=="GET") $ret = get_pages();
			break;
		case "block":
			if($mode=="PUT") $ret = add_block($json);
			if($mode=="POST") $ret = update_block($id, $json);
			if($mode=="GET") $ret = get_blocks($page_id);
			break;
		case "item":
			if($mode=="PUT") $ret = add_item($json);
			if($mode=="POST") $ret = update_item($id, $json);
			if($mode=="GET") $ret = get_items($block_id);
			break;
	}
	
	echo json_encode($ret);
?>