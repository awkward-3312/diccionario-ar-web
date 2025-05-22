<?php
header('Content-Type: text/plain');
$ch = curl_init("https://translate.astian.org/translate");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
$error = curl_error($ch);
$code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);
echo "Código de respuesta: $code\n";
echo "Error de cURL: $error\n";
echo "Respuesta:\n$response";
?>
