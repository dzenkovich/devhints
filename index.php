<?php
    require_once('sync.php');

	$mode = $_SERVER["REQUEST_METHOD"];
	$data = null;
	$page_id = null;
	$block_id = null;
	$item_id = null;
	$ret = null;
	$parts = explode("/", $_SERVER["REQUEST_URI"]);
	if(!$parts[0]) array_shift($parts);
	
	//if server sync call
	if($parts[0] == 'sync'){
		if(isset($parts[1]) && $parts[1]) $page_id = $parts[1];
		if(isset($parts[2]) && $parts[2]) $block_id = $parts[2];
		if(isset($parts[3]) && $parts[3]) $item_id = $parts[3];
		
		//data get calls
		if($mode=="GET"){
			if(!$page_id){
				$ret = get_pages();
			}
			elseif(!$block_id){
				$ret = get_blocks($page_id);
			}
			elseif(!$item_id){
				$ret = get_items($block_id);
			}
		}
		//data create calls
		if($mode=="POST"){
			$json = $_POST;
			$json = file_get_contents("php://input");
			
			if(!$page_id){
				$ret = add_page($json);
			}
			elseif(!$block_id){
				$ret = add_block($json);
			}
			elseif(!$item_id){
				$ret = add_item($json);
			}
		}
		//data update calls
		if($mode=="PUT"){
			$json = file_get_contents("php://input");
		
			if(!$block_id){
				$ret = update_page($page_id, $json);
			}
			elseif(!$item_id){
				$ret = update_block($block_id, $json);
			}
			else{
				$ret = update_item($item_id, $json);
			}
		}
		//data delete calls
		if($mode=="DELETE"){
			if(!$block_id){
				$ret = delete_page($page_id);
			}
			elseif(!$item_id){
				$ret = delete_block($block_id);
			}
			else{
				$ret = delete_item($item_id);
			}
		}
		
		echo json_encode($ret);
		exit;
	}
?>
<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="content-type" content="text/html; charset=utf-8">
        <link rel="stylesheet" type="text/css" href="/ui/css/all.css">
    </head>
    <body>
        <section id="app"></section>
        <script src="/ui/js/libs/jquery-min.js"></script>
        <script src="/ui/js/libs/underscore-min.js"></script>
        <script src="/ui/js/libs/backbone.js"></script>
        <script src="/ui/js/libs/mustache.js"></script>
        <script src="/ui/js/app.js"></script>
    </body>
</html>