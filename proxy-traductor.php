<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['q']) || !isset($data['target'])) {
  http_response_code(400);
  echo json_encode(["error" => "Parámetros incompletos"]);
  exit;
}

$body = json_encode([
  "q" => $data['q'],
  "source" => "auto",
  "target" => $data['target'],
  "format" => "text"
]);

// ✅ Nuevo endpoint sin API key
$ch = curl_init("https://translate.argosopentech.com/translate");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
  'Content-Type: application/json',
  'Accept: application/json'
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, $body);

$response = curl_exec($ch);
$httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

http_response_code($httpcode);
echo $response;
?>
