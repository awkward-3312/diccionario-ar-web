let sparkieLoaded = false;
// Cierra el modal al presionar Escape
function escSparkie(e){
  if(e.key === 'Escape') closeSparkieModal();
}
// Carga el script del chat si es necesario y muestra el modal
function openSparkieModal(){
  const modal = document.getElementById('sparkie-modal');
  const show = () => {
    modal.classList.remove('oculto','fade-out');
    modal.classList.add('fade-in');
    document.addEventListener('keydown', escSparkie);
    document.getElementById('pregunta')?.focus();
  };
  if(!sparkieLoaded){
    const script=document.createElement('script');
    script.src='js/chat-sparkie.js?v=4';
    script.onload=()=>{sparkieLoaded=true;show();};
    document.body.appendChild(script);
  }else{
    show();
  }
}
// Oculta el modal de chat y limpia eventos
function closeSparkieModal(){
  const modal=document.getElementById('sparkie-modal');
  modal.classList.remove('fade-in');
  modal.classList.add('fade-out');
  setTimeout(()=>modal.classList.add('oculto'),300);
  document.removeEventListener('keydown', escSparkie);
}
window.closeSparkieModal = closeSparkieModal;
document.addEventListener('DOMContentLoaded',()=>{
  document.getElementById('sparkie-boton')?.addEventListener('click', openSparkieModal); // 🔹 Abrir chat
  document.getElementById('btn-regresar')?.addEventListener('click', closeSparkieModal); // 🔹 Cerrar chat
});
