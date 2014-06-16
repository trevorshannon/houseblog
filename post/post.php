<?php
print_r($_FILES);
echo "<br>";
print_r($_POST);
echo "<br><br>";

$upload_path = "../";
$upload_dir = "img/";
$ok_ext = array("gif", "jpeg", "jpg", "png", "bmp");
$contents_file = "../js/contents.js";

echo "post content: <br>";
echo $_POST["content"];
echo "<br><br>";

$images = array();
for ($i = 0; $i < count($_FILES["ufile"]["name"]); $i++) {
  $ext = end(explode(".", $_FILES["ufile"]["name"][$i]));
  if ($_FILES["ufile"]["size"][$i] != 0 
      && in_array($ext, $ok_ext)
      && (($_FILES["ufile"]["type"][$i] == "image/gif")
       || ($_FILES["ufile"]["type"][$i] == "image/jpeg")
       || ($_FILES["ufile"]["type"][$i] == "image/png")
       || ($_FILES["ufile"]["type"][$i] == "image/bmp")
       || ($_FILES["ufile"]["type"][$i] == "image/pjpeg"))) {
    $filename = preg_replace("/[^A-Z0-9._-]/i", "_", $_FILES["ufile"]["name"][$i]);
    if ($_FILES["ufile"]["error"][$i] > 0) {
      echo "Error with " . $filename . ": "
          . $_FILES["ufile"]["error"][$i];
    } else {
      echo "Uploaded " . $filename . " with caption '" . $_POST["caption"][$i] . "'<br>";
      move_uploaded_file($_FILES["ufile"]["tmp_name"][$i], 
                         $upload_path . $upload_dir . $filename);
      chmod($upload_path . $upload_dir . $filename, 0664);
      echo "Stored in " . $upload_path . $upload_dir . $filename . "<br>";
      $output = shell_exec("../script/rsize $upload_path$upload_dir$filename");
      echo $output . "<br>";
      echo "<br>";
      
      array_push($images, array("filename" => $upload_dir . $filename,
                                "caption" => $_POST["caption"][$i]));
    }
  }
}

function html_format($str) {
  $arr = explode("\n", $str);
  $result = "";
  for ($i = 0; $i < count($arr); $i++) {
    $result = $result . "<p>" . $arr[$i] . "</p>";
    if ($i < count($arr) - 1) {
      $result = $result . "' +\n\t\t\t'";
    }
  }
  return $result;
}  

if ($_POST["content"] || $_POST["title"]) {
  $file = fopen($contents_file, "r+");
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

?>