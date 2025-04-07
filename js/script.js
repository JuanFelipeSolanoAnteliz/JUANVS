// URL del API
const API_URL = "https://6687db1d0bc7155dc01962d7.mockapi.io/ecomerce"

// Almacenamiento de registros
let registros = []

// Referencias a elementos del DOM
const form = document.getElementById("tapas-form")
const registrosBody = document.getElementById("registros-body")

// Constante para el número de tapas por promoción
const TAPAS_POR_PROMOCION = 25

// Función para cargar los registros desde la API
async function cargarRegistros() {
  const loadingIndicator = document.getElementById("loading-indicator")
  loadingIndicator.classList.add("loading")

  try {
    const response = await fetch(API_URL)
    if (!response.ok) {
      throw new Error("Error al cargar los datos")
    }
    registros = await response.json()
    mostrarRegistros()
  } catch (error) {
    console.error("Error:", error)
    alert("No se pudieron cargar los registros. Por favor, intente de nuevo más tarde.")
  } finally {
    loadingIndicator.classList.remove("loading")
  }
}

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

// Modificar la función mostrarRegistros para incluir los totales
function mostrarRegistros() {
  registrosBody.innerHTML = ""

  // Variables para calcular los totales
  let totalPromociones = 0
  let totalTapasPlastico = 0
  let totalTapasMetalica = 0
  let totalTapasGeneral = 0

  registros.forEach((registro) => {
    const row = document.createElement("tr")

    // Sumar a los totales
    totalPromociones += Number.parseInt(registro.n_promociones) || 0
    totalTapasPlastico += Number.parseInt(registro.tapas_plastico) || 0
    totalTapasMetalica += Number.parseInt(registro.tapas_metalica) || 0
    totalTapasGeneral += Number.parseInt(registro.total_tapas) || 0

    row.innerHTML = `
            <td>${registro.ruta}</td>
            <td>${registro.n_promociones}</td>
            <td>${registro.tapas_plastico}</td>
            <td>${registro.tapas_metalica}</td>
            <td>${registro.total_tapas}</td>
            <td>
                <button class="btn-delete" data-id="${registro.id}">Eliminar</button>
            </td>
        `

    registrosBody.appendChild(row)
  })

  // Agregar fila de totales
  const totalRow = document.createElement("tr")
  totalRow.className = "fila-totales"
  totalRow.innerHTML = `
        <td><strong>TOTALES</strong></td>
        <td><strong>${totalPromociones}</strong></td>
        <td><strong>${totalTapasPlastico}</strong></td>
        <td><strong>${totalTapasMetalica}</strong></td>
        <td><strong>${totalTapasGeneral}</strong></td>
        <td></td>
    `
  registrosBody.appendChild(totalRow)

  // Agregar event listeners a los botones de eliminar
  document.querySelectorAll(".btn-delete").forEach((button) => {
    button.addEventListener("click", function () {
      const id = this.getAttribute("data-id")
      eliminarRegistro(id)
    })
  })
}

// Función para agregar un nuevo registro
async function agregarRegistro(e) {
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

  try {
    // Mostrar indicador de carga
    const submitBtn = form.querySelector(".btn-submit")
    const originalText = submitBtn.textContent
    submitBtn.textContent = "Guardando..."
    submitBtn.disabled = true

    // Enviar datos a la API
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(nuevoRegistro),
    })

    if (!response.ok) {
      throw new Error("Error al guardar el registro")
    }

    // Recargar los registros desde la API
    await cargarRegistros()

    // Limpiar el formulario
    form.reset()
    document.getElementById("tapas_plastico").value = ""
    document.getElementById("tapas_metalica").value = ""
    document.getElementById("total_tapas").value = ""

    alert("Registro guardado con éxito!")
  } catch (error) {
    console.error("Error:", error)
    alert("No se pudo guardar el registro. Por favor, intente de nuevo más tarde.")
  } finally {
    // Restaurar el botón
    const submitBtn = form.querySelector(".btn-submit")
    submitBtn.textContent = "Guardar Registro"
    submitBtn.disabled = false
  }
}

// Función para eliminar un registro
async function eliminarRegistro(id) {
  if (confirm("¿Está seguro de que desea eliminar este registro?")) {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Error al eliminar el registro")
      }

      // Recargar los registros desde la API
      await cargarRegistros()
    } catch (error) {
      console.error("Error:", error)
      alert("No se pudo eliminar el registro. Por favor, intente de nuevo más tarde.")
    }
  }
}

// Event listeners
form.addEventListener("submit", agregarRegistro)

// Inicializar la tabla al cargar la página
document.addEventListener("DOMContentLoaded", () => {
  cargarRegistros()

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

