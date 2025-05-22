<?php
// === CORS HEADERS NECESARIOS PARA POST desde JS ===
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
  echo json_encode(["error" => "Parámetros incompletos"]);
  exit;
}

$body = json_encode([
  "q" => $data['q'],
  "source" => "auto",
  "target" => $data['target'],
  "format" => "text"
]);

$ch = curl_init("https://translate.argosopentech.com/translate");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
  'Content-Type: application/json',
  'Accept: application/json'
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, $body);

$response = curl_exec($ch);

// Manejo de error de red en curl
if (curl_errno($ch)) {
  http_response_code(500);
  echo json_encode(["error" => "Error al contactar el servidor de traducción."]);
  curl_close($ch);
  exit;
}

$httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

// Verificar si la respuesta no vino vacía
if (empty($response)) {
  http_response_code(502);
  echo json_encode(["error" => "Respuesta vacía del servidor de traducción."]);
  exit;
}

http_response_code($httpcode);
echo $response;
?>
