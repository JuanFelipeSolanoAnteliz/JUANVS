// Almacenamiento de registros
const registros = JSON.parse(localStorage.getItem("registros")) || []

// Referencias a elementos del DOM
const form = document.getElementById("tapas-form")
const registrosBody = document.getElementById("registros-body")

// Constante para el número de tapas por promoción
const TAPAS_POR_PROMOCION = 25

// Función para calcular el total de tapas basado en el número de promociones
function calcularTotalTapas() {
  const nPromociones = Number.parseInt(document.getElementById("n_promociones").value) || 0
  const totalTapas = nPromociones * TAPAS_POR_PROMOCION
  document.getElementById("total_tapas").value = totalTapas

  // Limpiar los campos de tapas específicas
  document.getElementById("tapas_plastico").value = ""
  document.getElementById("tapas_metalica").value = ""
  document.getElementById("tapas_ingresadas").value = ""
}

// Función para calcular la cantidad de tapas restantes
function calcularTapaRestante() {
  const nPromociones = Number.parseInt(document.getElementById("n_promociones").value) || 0
  const totalTapas = nPromociones * TAPAS_POR_PROMOCION
  const tapasIngresadas = Number.parseInt(document.getElementById("tapas_ingresadas").value) || 0

  // Verificar que no se ingresen más tapas que el total
  if (tapasIngresadas > totalTapas) {
    alert(`No puede ingresar más de ${totalTapas} tapas para ${nPromociones} promociones.`)
    document.getElementById("tapas_ingresadas").value = totalTapas
    return calcularTapaRestante()
  }

  const tipoTapa = document.querySelector('input[name="tipo-tapa"]:checked').value

  if (tipoTapa === "plastico") {
    document.getElementById("tapas_plastico").value = tapasIngresadas
    document.getElementById("tapas_metalica").value = totalTapas - tapasIngresadas
  } else {
    document.getElementById("tapas_metalica").value = tapasIngresadas
    document.getElementById("tapas_plastico").value = totalTapas - tapasIngresadas
  }

  document.getElementById("total_tapas").value = totalTapas
}

// Función para mostrar los registros en la tabla
function mostrarRegistros() {
  registrosBody.innerHTML = ""

  registros.forEach((registro, index) => {
    const row = document.createElement("tr")

    row.innerHTML = `
            <td>${registro.ruta}</td>
            <td>${registro.n_promociones}</td>
            <td>${registro.tapas_plastico}</td>
            <td>${registro.tapas_metalica}</td>
            <td>${registro.total_tapas}</td>
            <td>
                <button class="btn-delete" data-index="${index}">Eliminar</button>
            </td>
        `

    registrosBody.appendChild(row)
  })

  // Agregar event listeners a los botones de eliminar
  document.querySelectorAll(".btn-delete").forEach((button) => {
    button.addEventListener("click", function () {
      const index = this.getAttribute("data-index")
      eliminarRegistro(index)
    })
  })
}

// Función para agregar un nuevo registro
function agregarRegistro(e) {
  e.preventDefault()

  const ruta = document.getElementById("ruta").value
  const nPromociones = Number.parseInt(document.getElementById("n_promociones").value) || 0
  const tapasPlastico = Number.parseInt(document.getElementById("tapas_plastico").value) || 0
  const tapasMetalica = Number.parseInt(document.getElementById("tapas_metalica").value) || 0
  const totalTapas = Number.parseInt(document.getElementById("total_tapas").value) || 0

  // Validaciones
  if (!ruta) {
    alert("Por favor ingrese la ruta.")
    return
  }

  if (nPromociones <= 0) {
    alert("El número de promociones debe ser mayor a 0.")
    return
  }

  if (tapasPlastico + tapasMetalica !== totalTapas) {
    alert("La suma de tapas plásticas y metálicas debe ser igual al total de tapas.")
    return
  }

  // Crear nuevo registro
  const nuevoRegistro = {
    ruta,
    n_promociones: nPromociones,
    tapas_plastico: tapasPlastico,
    tapas_metalica: tapasMetalica,
    total_tapas: totalTapas,
  }

  // Agregar al array y guardar en localStorage
  registros.push(nuevoRegistro)
  localStorage.setItem("registros", JSON.stringify(registros))

  // Actualizar la tabla y limpiar el formulario
  mostrarRegistros()
  form.reset()
  document.getElementById("tapas_plastico").value = ""
  document.getElementById("tapas_metalica").value = ""
  document.getElementById("total_tapas").value = ""

  alert("Registro guardado con éxito!")
}

// Función para eliminar un registro
function eliminarRegistro(index) {
  if (confirm("¿Está seguro de que desea eliminar este registro?")) {
    registros.splice(index, 1)
    localStorage.setItem("registros", JSON.stringify(registros))
    mostrarRegistros()
  }
}

// Event listeners
form.addEventListener("submit", agregarRegistro)

// Inicializar la tabla al cargar la página
document.addEventListener("DOMContentLoaded", () => {
  mostrarRegistros()

  // Agregar event listeners para los radio buttons
  document.querySelectorAll('input[name="tipo-tapa"]').forEach((radio) => {
    radio.addEventListener("change", () => {
      const tapasIngresadas = document.getElementById("tapas_ingresadas")
      if (tapasIngresadas.value) {
        calcularTapaRestante()
      }
    })
  })
})

