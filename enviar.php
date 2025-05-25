<?php
// --- Seguridad: Honeypot ---
if (!empty($_POST['empresa'])) {
  http_response_code(403);
  exit("Acceso denegado.");
}

// --- Validación básica ---
$nombre  = htmlspecialchars(trim($_POST['nombre'] ?? ''));
$email   = filter_var(trim($_POST['email'] ?? ''), FILTER_VALIDATE_EMAIL);
$mensaje = htmlspecialchars(trim($_POST['mensaje'] ?? ''));

if (!$nombre || !$email || !$mensaje) {
  http_response_code(400);
  exit("Faltan datos requeridos.");
}

// --- Configuración del correo ---
$para    = "contact_info@diccionario-ar.com";
$titulo  = "Nuevo mensaje de contacto desde Diccionario AR";
$cuerpo  = "Has recibido un nuevo mensaje desde el formulario web:\n\n";
$cuerpo .= "Nombre: $nombre\n";
$cuerpo .= "Correo: $email\n\n";
$cuerpo .= "Mensaje:\n$mensaje\n";

$cabeceras = "From: contacto@diccionario-ar.com\r\n";
$cabeceras .= "Reply-To: $email\r\n";
$cabeceras .= "Content-Type: text/plain; charset=UTF-8\r\n";

// --- Enviar el correo ---
$enviado = mail($para, $titulo, $cuerpo, $cabeceras);

if ($enviado) {
  header("Location: https://www.diccionario-ar.com/gracias.html");
  exit;
} else {
  http_response_code(500);
  echo "Hubo un error al enviar el mensaje.";
}
?>
