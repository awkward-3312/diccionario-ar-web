<?php
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  header('Access-Control-Allow-Origin: *');
  header('Access-Control-Allow-Methods: POST, OPTIONS');
  header('Access-Control-Allow-Headers: Content-Type');
  exit(0);
}

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['q']) || !isset($data['target'])) {
  http_response_code(400);
  echo json_encode(["error" => "Parámetros incompletos."]);
  exit;
}

$body = json_encode([
  "q" => $data['q'],
  "source" => "auto",
  "target" => $data['target'],
  "format" => "text"
]);

$url = "https://translate.astian.org/translate";

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
  'Content-Type: application/json',
  'Accept: application/json'
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, $body);

$response = curl_exec($ch);
$httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

if ($response === false || empty($response)) {
  http_response_code(502);
  echo json_encode([
    "error" => "❌ Fallo en la conexión al servidor de traducción.",
    "detalle" => $curlError ?: "Respuesta vacía o rechazada"
  ]);
  exit;
}

http_response_code($httpcode);
echo $response;
?>
