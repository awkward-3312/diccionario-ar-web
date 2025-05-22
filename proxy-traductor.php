<?php
// === Manejo de CORS para JS ===
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  header('Access-Control-Allow-Origin: *');
  header('Access-Control-Allow-Methods: POST, OPTIONS');
  header('Access-Control-Allow-Headers: Content-Type');
  exit(0);
}

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

// Leer el cuerpo de la petición
$data = json_decode(file_get_contents("php://input"), true);

// Validar parámetros
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

// Configurar cURL
$ch = curl_init("https://translate.argosopentech.com/translate");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
  'Content-Type: application/json',
  'Accept: application/json'
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, $body);

// Ejecutar la petición
$response = curl_exec($ch);
$httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

// Manejo de error en cURL
if ($response === false || empty($response)) {
  http_response_code(502);
  echo json_encode([
    "error" => "❌ Error al contactar el servidor de traducción.",
    "detalle" => $error
  ]);
  exit;
}

// Enviar respuesta JSON
http_response_code($httpcode);
echo $response;
?>
