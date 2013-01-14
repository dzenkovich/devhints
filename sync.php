<?php
	$db = new mysqli("localhost", "devhints", "1234", "devhints");

	function update_page($page_id, $json){
		global $db;
		
		$data = json_decode($json);
		
		$query = $db->prepare("UPDATE dh_pages SET data=? WHERE id = ?;");
		$query->bind_param("si", $json, $page_id);
		$query->execute();
		$changes = $query->affected_rows;
		$query->close();
		
		return $changes > 0;
	}
	
	function update_block($block_id, $json){
		global $db;
		
		$data = json_decode($json);
		
		$query = $db->prepare("UPDATE dh_blocks SET data=? WHERE id = ?;");
		$query->bind_param("si", $json, $block_id);
		$query->execute();
		$changes = $query->affected_rows;
		$query->close();
		
		return $changes > 0;
	}
	
	function update_item($item_id, $json){
		global $db;
		
		$data = json_decode($json);
		
		$query = $db->prepare("UPDATE dh_items SET data=? WHERE id = ?;");
		$query->bind_param("si", $json, $item_id);
		$query->execute();
		$changes = $query->affected_rows;
		$query->close();
		
		return $changes > 0;
	}
	
	function add_page($json){
		global $db;
		
		$data = json_decode($json);
		
		$query = $db->prepare("INSERT INTO dh_pages SET data=?;");
		$query->bind_param("s", $json);
		$query->execute();
		$query->close();
		
		return $db->insert_id;
	}
	
	function add_block($json){
		global $db;
		
		$data = json_decode($json);
		$page_id = $data->pageId;
		
		$query = $db->prepare("INSERT INTO dh_blocks SET page_id=?, data=?;");
		$query->bind_param("is", $page_id, $json);
		$query->execute();
		$query->close();
		
		return $db->insert_id;
	}
	
	function add_item($json){
		global $db;
		
		$data = json_decode($json);
		$block_id = $data->blockId;
		
		$query = $db->prepare("INSERT INTO dh_items SET block_id=?, data=?;");
		$query->bind_param("is", $block_id, $json);
		$query->execute();
		$query->close();
		
		return $db->insert_id;
	}
	
	function delete_page($page_id){
		global $db;
		
		$query = $db->prepare("UPDATE dh_pages SET deleted = 1 WHERE id=?;");
		$query->bind_param("i", $page_id);
		$query->execute();
		$changes = $query->affected_rows;
		$query->close();
		
		return $changes > 0;
	}
	
	function delete_block($block_id){
		global $db;
		
		$query = $db->prepare("UPDATE dh_blocks SET deleted = 1 WHERE id=?;");
		$query->bind_param("i", $block_id);
		$query->execute();
		$changes = $query->affected_rows;
		$query->close();
		
		return $changes > 0;
	}
	
	function delete_item($item_id){
		global $db;
		
		$query = $db->prepare("UPDATE dh_items SET deleted = 1 WHERE id=?;");
		$query->bind_param("i", $item_id);
		$query->execute();
		$changes = $query->affected_rows;
		$query->close();
		
		return $changes > 0;
	}
	
	function get_pages(){
		global $db;
		
		$pages = array();
		$res = $db->query("SELECT * FROM dh_pages WHERE deleted != 1;");
		$rows = $res->fetch_all(MYSQLI_ASSOC);
		for($i=0; $i<count($rows); $i++){
			$page = json_decode($rows[$i]['data']);
			$page->id = $rows[$i]['id'];
			array_push($pages, $page);
		}
		
		return $pages;
	}
	
	function get_blocks($page_id){
		global $db;
		
		$blocks = array();
		$query = $db->prepare("SELECT * FROM dh_blocks WHERE page_id=? AND deleted != 1;");
		$query->bind_param("i", $page_id);
		$query->execute();
		$res = $query->get_result();
		$query->close();
		$rows = $res->fetch_all(MYSQLI_ASSOC);
		for($i=0; $i<count($rows); $i++){
			$block = json_decode($rows[$i]['data']);
			$block->id = $rows[$i]['id'];
			array_push($blocks, $block);
		}
		
		return $blocks;
	}
	
	function get_items($block_id){
		global $db;
		
		$items = array();
		$query = $db->prepare("SELECT * FROM dh_items WHERE block_id=? AND deleted != 1;");
		$query->bind_param("i", $block_id);
		$query->execute();
		$res = $query->get_result();
		$query->close();
		$rows = $res->fetch_all(MYSQLI_ASSOC);
		for($i=0; $i<count($rows); $i++){
			$item = json_decode($rows[$i]['data']);
			$item->id = $rows[$i]['id'];
			array_push($items, $item);
		}
		
		return $items;
	}
?>