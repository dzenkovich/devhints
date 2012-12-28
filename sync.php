<?php
	$db = new mysqli("localhost", "devhints", "1234", "devhints");
	
	function get_page_id_by_url($page_url){
		global $db;
		
		$query = $db->prepare("SELECT id FROM dh_pages WHERE url=?;");
		$query->bind_param("s", $page_url);
		$query->execute();
		$res = $query->get_result();
		$query->close();
		
		$row = $res->fetch_row();
		return $row?$row[0]:null;
	}
	
	function get_block_id_by_url($block_url){
		global $db;
		
		$query = $db->prepare("SELECT id FROM dh_blocks WHERE url=?;");
		$query->bind_param("s", $block_url);
		$query->execute();
		$res = $query->get_result();
		$query->close();
		
		$row = $res->fetch_row();
		return $row?$row[0]:null;
	}
	
	function get_item_id_by_url($item_url){
		global $db;
		
		$query = $db->prepare("SELECT id FROM dh_items WHERE url=?;");
		$query->bind_param("s", $item_url);
		$query->execute();
		$res = $query->get_result();
		$query->close();
		
		$row = $res->fetch_row();
		return $row?$row[0]:null;
	}

	function update_page($page_url, $json){
		global $db;
		
		$page_id = get_page_id_by_url($page_url);
		$data = json_decode($json);
		$new_url = $data->url;
		
		$query = $db->prepare("UPDATE dh_pages SET data=?, url=? WHERE id = ?;");
		$query->bind_param("ssi", $json, $new_url, $page_id);
		$query->execute();
		$changes = $query->affected_rows;
		$query->close();
		
		return $changes > 0;
	}
	
	function update_block($block_url, $json){
		global $db;
		
		$block_id = get_block_id_by_url($block_url);
		$data = json_decode($json);
		$new_url = $data->url;
		
		$query = $db->prepare("UPDATE dh_blocks SET data=?, url=? WHERE id = ?;");
		$query->bind_param("ssi", $json, $new_url, $block_id);
		$query->execute();
		$changes = $query->affected_rows;
		$query->close();
		
		return $changes > 0;
	}
	
	function update_item($item_url, $json){
		global $db;
		
		$item_id = get_item_id_by_url($block_url);
		$data = json_decode($json);
		$new_url = $data->url;
		
		$query = $db->prepare("UPDATE dh_items SET data=?, url=? WHERE id = ?;");
		$query->bind_param("ssi", $json, $new_url, $item_id);
		$query->execute();
		$changes = $query->affected_rows;
		$query->close();
		
		return $changes > 0;
	}
	
	function add_page($json){
		global $db;
		
		$data = json_decode($json);
		$url = $data->url;
		
		$query = $db->prepare("INSERT INTO dh_pages SET data=?, url=?;");
		$query->bind_param("ss", $json, $url);
		$query->execute();
		$query->close();
		
		return $db->insert_id;
	}
	
	function add_block($json){
		global $db;
		
		$data = json_decode($json);
		$url = $data->url;
		
		$query = $db->prepare("INSERT INTO dh_blocks SET data=?, url=?;");
		$query->bind_param("ss", $json, $url);
		$query->execute();
		$query->close();
		
		return $db->insert_id;
	}
	
	function add_item($json){
		global $db;
		
		$data = json_decode($json);
		$url = $data->url;
		
		$query = $db->prepare("INSERT INTO dh_items SET data=?, url=?;");
		$query->bind_param("ss", $json, $url);
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
	
	function get_blocks($page_url){
		global $db;
		
		$page_id = get_page_id_by_url($page_url);
		
		$blocks = array();
		$query = $db->prepare("SELECT * FROM dh_blocks WHERE page_id=?;");
		$query->bind_param("i", $page_id);
		$query->execute();
		$res = $query->get_result();
		$query->close();
		$rows = $res->fetch_all(MYSQLI_ASSOC);
		for($i=0; $i<count($rows); $i++){
			$block = json_decode($rows[$i]['data']);
			$block->dbid = $rows[$i]['id'];
			array_push($blocks, $block);
		}
		
		return $blocks;
	}
	
	function get_items($block_url){
		global $db;
		
		$block_id = get_block_id_by_url($block_url);
		
		$items = array();
		$query = $db->prepare("SELECT * FROM dh_items WHERE block_id=?;");
		$query->bind_param("i", $block_id);
		$query->execute();
		$res = $query->get_result();
		$query->close();
		$rows = $res->fetch_all(MYSQLI_ASSOC);
		for($i=0; $i<count($rows); $i++){
			$item = json_decode($rows[$i]['data']);
			$item->dbid = $rows[$i]['id'];
			array_push($items, $item);
		}
		
		return $items;
	}
?>