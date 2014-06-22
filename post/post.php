<?php
$contents_file = "../js/contents.js";
$images = array();

/*function custom_error_handler($errno, $errstr, $errfile, $errline) {
  switch ($errno) {
  case E_USER_ERROR:
    error_log(print_r($_POST, true));
    error_log(print_r($_FILES, true));
    echo "<br>(_POST and _FILES variables have been logged to /var/log/php5/apache2/error.log)<br>";
    break;
  default:
    break; 
  } 
  // execute internal PHP error handler too.
  return false;
}*/

function exit_cleanly() {
  echo "<h2>Could not create new post.  Please fix the bug and refresh to try again</h2>";
  print_debug_info();
  echo "</body></html>";
  exit();
}

function print_debug_info() {
  echo "<div style=\"margin-top:50px;\">Debug info (logged to /var/log/apache2/error.log):<br>";
  echo "FILES = ";
  print_r($_FILES);
  echo "<br>";
  echo "POST = ";
  print_r($_POST);
  //echo "<br><a href=\"javascript:void(0)\" onClick=\"cancelRedirect()\">Cancel redirect</a>";
  echo "</div>";
}

function upload_and_resize_images() {
  global $images;

  $file_errors = array("UPLOAD_ERR_OK", "UPLOAD_ERR_INI_SIZE",
    "UPLOAD_ERR_FORM_SIZE", "UPLOAD_ERR_PARTIAL",
    "UPLOAD_ERR_NO_FILE", "UPLOAD_ERR_NO_TMP_DIR",
    "UPLOAD_ERR_CANT_WRITE", "UPLOAD_ERR_EXTENSION");
  $upload_path = "../";
  $upload_dir = "img/";
  $ok_ext = array("gif", "jpeg", "jpg", "png", "bmp");
  
  if (!array_key_exists("ufile", $_FILES)) {
    return true;
  }
  for ($i = 0; $i < count($_FILES["ufile"]["name"]); $i++) {
    $filename = preg_replace("/[^A-Z0-9._-]/i", "_", $_FILES["ufile"]["name"][$i]);
    if ($_FILES["ufile"]["error"][$i] > 0) {
      $errno = $_FILES["ufile"]["error"][$i];
      echo "<br>Error with $filename: [$errno] $file_errors[$errno]<br>";
    } else {
      $ext = end(explode(".", $_FILES["ufile"]["name"][$i]));
      if ($_FILES["ufile"]["size"][$i] != 0 
	  && in_array($ext, $ok_ext)
	  && (($_FILES["ufile"]["type"][$i] == "image/gif")
	   || ($_FILES["ufile"]["type"][$i] == "image/jpeg")
	   || ($_FILES["ufile"]["type"][$i] == "image/png")
	   || ($_FILES["ufile"]["type"][$i] == "image/bmp")
	   || ($_FILES["ufile"]["type"][$i] == "image/pjpeg"))) {
	echo "Uploaded <b>" . $filename . "</b> with caption <b>'" . $_POST["caption"][$i] . "'</b><br>";
	move_uploaded_file($_FILES["ufile"]["tmp_name"][$i], 
			     $upload_path . $upload_dir . $filename);
	chmod($upload_path . $upload_dir . $filename, 0664);
	if ($_FILES["ufile"]["type"][$i] != "image/gif") {
	  $output = shell_exec("../script/rsize $upload_path$upload_dir$filename");
	  echo $output . "<br>";
	} else {
	  echo "Not resizing this image <br>";
	}
	echo "<br>";
	array_push($images, array("filename" => $upload_dir . $filename,
				    "caption" => $_POST["caption"][$i]));
      }
    }
  }
  return true;
}

function html_format($str) {
  //TODO(trevor): handle both <p> and <br>
  $arr = explode("\n", $str);
  $result = "<p>";
  for ($i = 0; $i < count($arr); $i++) {
    $text_block = trim($arr[$i]);
    $result = $result . $text_block;
    // if next block of text is a blank line, start a new paragraph
    // otherwise, just add a line break.
    if (($i + 1) < count($arr)) {
      if (trim($arr[$i + 1]) == "") {
        $result = $result . "</p>' +\n\t\t\t'<p>";
        //don't process the blank line
        $i = $i + 1;
      } else {
        $result = $result . "<br>";
      }
    }
  }
  $result = $result . "</p>";
  return $result;
}  

error_log(print_r($_POST, true));
error_log(print_r($_FILES, true));
echo "<html><head>";
echo "<script src  =\"js/redirect.js\"></script>";
echo "</head><body>";
      
if ($_POST["content"] || $_POST["title"] || array_key_exists("ufile", $_FILES)) {
  echo "Writing new post with content: <br>";
  echo $_POST["content"];
  if (!upload_and_resize_images()) {
    echo "<h2>Warning: Image upload failed!</h2>";
  }
  if (!file_exists($contents_file)) {
    echo $contents_file . " does not exist!</br>";
    exit_cleanly();
  } else {
    $file = fopen($contents_file, "r+");
    if (!$file) {
      echo "Error opening " . $contents_file . "!<br>";
      exit_cleanly();
    }
    #TODO(trevor): search for ]; instead of hardcoding -3
    fseek($file, -3, SEEK_END);
    $post_js = ",\n\t{\n" . 
	       "\t\t'title': '" . addslashes($_POST["title"]) . "',\n" . 
	       "\t\t'date': " . time()*1000 . ",\n" .
	       "\t\t'author': '" . $_POST["author"] . "',\n" .
	       "\t\t'contents' :\n" . 
	       "\t\t\t'" . html_format(str_replace("\r", "", addslashes($_POST["content"]))) . "',\n" .
	       "\t\t'images' : [\n";

    for ($i = 0; $i < count($images); $i++) {
      $post_js = $post_js . "\t\t\t{\n" . 
		 "\t\t\t\t'caption': '" . addslashes($images[$i]["caption"]) . "',\n" .
		 "\t\t\t\t'url': '" . $images[$i]["filename"] . "'\n" .
	         "\t\t\t}";
      if ($i < count($images) - 1) {
	$post_js = $post_js . ",";
      }
      $post_js = $post_js . "\n";
    }
    $post_js = $post_js . "\t\t]\n" . 
	       "\t}\n" .
	       "];"; 

    fwrite($file, $post_js);
    fclose($file);
  }
  echo "<br><br><br>";
  echo "<a target=\"_blank\" href=\"../index.html\">Go to your post >></a></div>";
}

print_debug_info();
echo "</body></html>";

?>