export function crearModeloPuerta(THREE, textura) {
  const grupo = new THREE.Group();
  grupo.name = 'Puerta Placa · prueba de marco y contramarco';
  const pared = new THREE.Group();
  pared.name = 'Paño de pared';
  grupo.add(pared);

  const hoja = new THREE.Group();
  hoja.name = 'Hoja Placa';
  hoja.position.set(-0.404, 0, 0.107);
  grupo.add(hoja);

  function madera(nombre, horizontal, repetirX, repetirY) {
    const mapa = textura.clone();
    mapa.name = nombre;
    mapa.wrapS = mapa.wrapT = THREE.RepeatWrapping;
    mapa.colorSpace = THREE.SRGBColorSpace;
    mapa.center.set(0.5, 0.5);
    mapa.repeat.set(repetirX, repetirY);
    mapa.rotation = horizontal ? Math.PI / 2 : 0;
    mapa.needsUpdate = true;
    return new THREE.MeshStandardMaterial({ name: nombre, map: mapa, roughness: 0.62, metalness: 0 });
  }

  const maderaHoja = madera('Nogal · hoja', false, 0.8, 1.5);
  const maderaVertical = madera('Nogal · elementos verticales', false, 0.13, 1.5);
  const maderaHorizontal = madera('Nogal · elementos horizontales', true, 0.13, 0.8);
  const revoque = new THREE.MeshStandardMaterial({ name: 'Pared clara', color: 0xe3dfd5, roughness: 0.94 });
  const metal = new THREE.MeshStandardMaterial({ name: 'Herrajes satinados', color: 0x9da19e, metalness: 0.85, roughness: 0.3 });
  const ranura = new THREE.MeshStandardMaterial({ name: 'Ranura de cerradura', color: 0x343633, roughness: 0.7 });

  function caja(nombre, ancho, alto, profundidad, x, y, z, material, padre = grupo) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(ancho, alto, profundidad), material);
    mesh.name = nombre;
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    padre.add(mesh);
    return mesh;
  }

  function cilindro(nombre, radio, largo, x, y, z, eje, padre) {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radio, radio, largo, 24), metal);
    mesh.name = nombre;
    mesh.position.set(x, y, z);
    if (eje === 'z') mesh.rotation.x = Math.PI / 2;
    if (eje === 'x') mesh.rotation.z = Math.PI / 2;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    padre.add(mesh);
    return mesh;
  }

  caja('Pared izquierda', 0.295, 2.08, 0.18, -0.6125, 1.04, 0, revoque, pared);
  caja('Pared derecha', 0.295, 2.08, 0.18, 0.6125, 1.04, 0, revoque, pared);
  caja('Pared sobre el dintel', 1.52, 0.26, 0.18, 0, 2.21, 0, revoque, pared);

  const marco = new THREE.Group();
  marco.name = 'Marco de madera';
  grupo.add(marco);
  caja('Jamba izquierda', 0.05, 2.03, 0.18, -0.44, 1.015, 0, maderaVertical, marco);
  caja('Jamba derecha', 0.05, 2.03, 0.18, 0.44, 1.015, 0, maderaVertical, marco);
  caja('Dintel del marco', 0.93, 0.05, 0.18, 0, 2.055, 0, maderaHorizontal, marco);

  caja('Rebaje lateral izquierdo', 0.024, 2.006, 0.019, -0.403, 1.003, 0.0245, maderaVertical, marco);
  caja('Rebaje lateral derecho', 0.024, 2.006, 0.019, 0.403, 1.003, 0.0245, maderaVertical, marco);
  caja('Rebaje superior', 0.83, 0.024, 0.019, 0, 2.018, 0.0245, maderaHorizontal, marco);

  for (const lado of [-1, 1]) {
    const cara = lado === 1 ? 'frontal' : 'posterior';
    const contramarco = new THREE.Group();
    contramarco.name = `Contramarco ${cara}`;
    grupo.add(contramarco);
    caja(`Contramarco izquierdo ${cara}`, 0.08, 2.038, 0.026, -0.463, 1.019, lado * 0.103, maderaVertical, contramarco);
    caja(`Contramarco derecho ${cara}`, 0.08, 2.038, 0.026, 0.463, 1.019, lado * 0.103, maderaVertical, contramarco);
    caja(`Contramarco superior ${cara}`, 1.006, 0.08, 0.026, 0, 2.078, lado * 0.103, maderaHorizontal, contramarco);
  }

  const panel = caja('Panel completo de la hoja', 0.8, 2, 0.044, 0.404, 1.015, -0.047, maderaHoja, hoja);
  panel.userData.tipo = 'Hoja esquemática, sin composición interior representada';

  for (const altura of [0.24, 1.015, 1.79]) {
    cilindro('Perno de bisagra', 0.007, 0.078, -0.404, altura, 0.107, 'y', marco);
    caja('Ala de bisagra sobre marco', 0.026, 0.062, 0.002, -0.425, altura, 0.091, metal, marco);
    caja('Ala de bisagra sobre hoja', 0.025, 0.062, 0.002, 0.017, altura, -0.024, metal, hoja);
    caja('Unión de bisagra', 0.006, 0.05, 0.025, 0.005, altura, -0.0125, metal, hoja);
  }

  for (const lado of [-1, 1]) {
    const cara = lado === 1 ? 'frontal' : 'posterior';
    const superficie = lado === 1 ? -0.025 : -0.069;
    const x = 0.704;
    cilindro(`Roseta de manija ${cara}`, 0.022, 0.004, x, 1.03, superficie + lado * 0.003, 'z', hoja);
    cilindro(`Cuello de manija ${cara}`, 0.007, 0.024, x, 1.03, superficie + lado * 0.017, 'z', hoja);
    cilindro(`Manija ${cara}`, 0.006, 0.11, x - 0.047, 1.03, superficie + lado * 0.031, 'x', hoja);
    cilindro(`Bocallave ${cara}`, 0.012, 0.003, x, 0.925, superficie + lado * 0.0025, 'z', hoja);
    caja(`Ranura de llave ${cara}`, 0.002, 0.012, 0.0008, x, 0.925, superficie + lado * 0.0044, ranura, hoja);
  }

  hoja.userData.aperturaMaxima = -95 * Math.PI / 180;
  grupo.userData.descripcion = 'Esquema tridimensional de prueba. No representa cotas ni detalles de fabricación.';
  return { grupo, hoja, pared };
}
