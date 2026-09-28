const projectName = document.body.dataset.project;
const queryDialog = document.querySelector('#project-query-dialog');
const queryMessage = document.querySelector('#project-message');
const queryWhatsapp = document.querySelector('#project-whatsapp');
const photoDialog = document.querySelector('#project-photo-dialog');
const enlargedImage = document.querySelector('#project-enlarged-image');

document.querySelector('#project-review-query').addEventListener('click', () => {
  queryMessage.value = `Hola, Marroncelli. Vi la obra ${projectName} en su sitio y quiero algo así para mi proyecto.\n\nMe gustaría recibir asesoramiento para elegir el modelo de puerta, el acabado y el sistema de marco adecuados para mi obra.\n\nDatos de mi proyecto: `;
  queryWhatsapp.href = `https://wa.me/5491126696918?text=${encodeURIComponent(queryMessage.value)}`;
  queryDialog.showModal();
});

queryMessage.addEventListener('input', () => {
  queryWhatsapp.href = `https://wa.me/5491126696918?text=${encodeURIComponent(queryMessage.value)}`;
});

document.querySelectorAll('.project-photo-button').forEach(button => {
  button.addEventListener('click', () => {
    const image = button.querySelector('img');
    enlargedImage.src = image.src;
    enlargedImage.alt = image.alt;
    enlargedImage.width = Number(image.getAttribute('width'));
    enlargedImage.height = Number(image.getAttribute('height'));
    document.querySelector('#project-photo-title').textContent = `${projectName} · Fotografía ${button.dataset.photo}`;
    document.querySelector('#project-photo-caption').textContent = `${button.dataset.caption} · Archivo Marroncelli`;
    photoDialog.showModal();
  });
});
