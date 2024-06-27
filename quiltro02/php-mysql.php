<?php
$conexion = mysql_connect("localhost", "mesihas", "mesihas");
mysql_select_db("demo", $conexion);

$queEmp = "SELECT * FROM empresa ORDER BY nombre ASC";
$resEmp = mysql_query($queEmp, $conexion) or die(mysql_error());
$totEmp = mysql_num_rows($resEmp);
?>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1" />
<title>Ejemplo PHP-MySQL</title>
<style type="text/css">
<!--
body {
	font-family: "Trebuchet MS", Tahoma, Verdana;
	font-size: 12px;
	font-weight: normal;
	color: #666666;
	text-decoration: none;
	padding: 20px;
}
h4 {
	color: #CC0000;
}
-->
</style>
</head>
<body>
<h4>Ejemplo PHP-MySQL</h4>
<?php 
if ($totEmp> 0) {
	while ($rowEmp = mysql_fetch_assoc($resEmp)) {
		echo "<strong>".$rowEmp['nombre']."</strong><br>";
		echo "Direccion: ".$rowEmp['direccion']."<br>";
		echo "imagen: ".$rowEmp['imagen']."<br>";
		echo "Telefono: ".$rowEmp['telefono']."<br><br>";
	}
}
?>
</body>
</html>
