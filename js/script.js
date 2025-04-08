// URL del API
const API_URL = "https://6687db1d0bc7155dc01962d7.mockapi.io/ecomerce"

// Almacenamiento de registros
let registros = []

// Referencias a elementos del DOM
const form = document.getElementById("tapas-form")
const registrosBody = document.getElementById("registros-body")
const modal = document.getElementById("edit-modal")
const closeModalBtn = document.querySelector(".close-modal")
const editForm = document.getElementById("edit-form")

// Constante para el número de tapas por promoción
const TAPAS_POR_PROMOCION = 25

// Función para cargar los registros desde la API
async function cargarRegistros() {
  const loadingIndicator = document.getElementById("loading-indicator")
  if (loadingIndicator) {
    loadingIndicator.classList.add("loading")
  }

  try {
    console.log("Obteniendo registros desde:", API_URL)
    const response = await fetch(API_URL)

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status} ${response.statusText}`)
    }

    registros = await response.json()
    console.log("Registros obtenidos:", registros)
    mostrarRegistros()
  } catch (error) {
    console.error("Error al cargar registros:", error)
    alert("No se pudieron cargar los registros. Por favor, intente de nuevo más tarde.")
  } finally {
    if (loadingIndicator) {
      loadingIndicator.classList.remove("loading")
    }
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

// Modificar la función mostrarRegistros para incluir los totales y botones de editar
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

    // Crear las celdas de la fila
    row.innerHTML = `
      <td>${registro.ruta}</td>
      <td>${registro.n_promociones}</td>
      <td>${registro.tapas_plastico}</td>
      <td>${registro.tapas_metalica}</td>
      <td>${registro.total_tapas}</td>
      <td>
        <button class="btn-edit" data-id="${registro.id}" data-ruta="${registro.ruta}">Editar</button>
        <button class="btn-delete" data-ruta="${registro.ruta}">Eliminar</button>
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
      const ruta = this.getAttribute("data-ruta")
      console.log("Intentando eliminar registro con ruta:", ruta)
      eliminarRegistro(ruta)
    })
  })

  // Agregar event listeners a los botones de editar
  document.querySelectorAll(".btn-edit").forEach((button) => {
    button.addEventListener("click", function () {
      const id = this.getAttribute("data-id")
      const ruta = this.getAttribute("data-ruta")
      console.log("Abriendo modal para editar registro con ID:", id, "y ruta:", ruta)
      abrirModalEdicion(id)
    })
  })
}

// Función para abrir el modal de edición
function abrirModalEdicion(id) {
  const registro = registros.find((r) => r.id === id)
  if (!registro) {
    alert("No se encontró el registro para editar.")
    return
  }

  // Llenar el formulario con los datos del registro
  document.getElementById("edit-record-id").value = registro.id
  document.getElementById("edit-original-ruta").value = registro.ruta
  document.getElementById("edit-original-promociones").value = registro.n_promociones
  document.getElementById("edit-ruta").value = registro.ruta
  document.getElementById("edit-n-promociones").value = registro.n_promociones
  document.getElementById("edit-tapas-plastico").value = registro.tapas_plastico
  document.getElementById("edit-tapas-metalica").value = registro.tapas_metalica
  document.getElementById("edit-total-tapas").value = registro.total_tapas

  // Ocultar el contenedor de ajuste de tapas inicialmente
  document.getElementById("ajuste-tapas-container").style.display = "none"

  // Mostrar el modal
  modal.style.display = "block"
}

// Función para calcular los cambios cuando se modifica el número de promociones en el modal
function calcularCambioPromociones() {
  const originalPromociones = Number.parseInt(document.getElementById("edit-original-promociones").value) || 0
  const nuevasPromociones = Number.parseInt(document.getElementById("edit-n-promociones").value) || 0

  const originalTotalTapas = originalPromociones * TAPAS_POR_PROMOCION
  const nuevoTotalTapas = nuevasPromociones * TAPAS_POR_PROMOCION

  const tapasPlastico = Number.parseInt(document.getElementById("edit-tapas-plastico").value) || 0
  const tapasMetalica = Number.parseInt(document.getElementById("edit-tapas-metalica").value) || 0

  // Actualizar el total de tapas
  document.getElementById("edit-total-tapas").value = nuevoTotalTapas

  const ajusteContainer = document.getElementById("ajuste-tapas-container")
  const mensajeAjuste = document.getElementById("mensaje-ajuste")

  if (nuevasPromociones !== originalPromociones) {
    // Si cambian las promociones, preguntar qué tipo de tapa mantener igual
    ajusteContainer.style.display = "block"

    if (nuevasPromociones > originalPromociones) {
      mensajeAjuste.textContent = `Se agregarán ${nuevoTotalTapas - originalTotalTapas} tapas. Seleccione qué tipo de tapa mantener igual:`
    } else {
      mensajeAjuste.textContent = `Se quitarán ${originalTotalTapas - nuevoTotalTapas} tapas. Seleccione qué tipo de tapa mantener igual:`
    }

    // Cambiar el texto de los radio buttons
    document.querySelector('label[for="edit-ajuste-plastico"]').textContent = "Mantener Tapas Plástico"
    document.querySelector('label[for="edit-ajuste-metalica"]').textContent = "Mantener Tapas Metálicas"

    // Agregar event listeners para los radio buttons de ajuste
    document.querySelectorAll('input[name="edit-tipo-ajuste"]').forEach((radio) => {
      radio.addEventListener("change", function () {
        const tipoAjuste = this.value
        if (tipoAjuste === "plastico") {
          // Mantener tapas plástico igual, ajustar tapas metálicas
          document.getElementById("edit-tapas-plastico").value = tapasPlastico
          document.getElementById("edit-tapas-metalica").value = nuevoTotalTapas - tapasPlastico
        } else {
          // Mantener tapas metálicas igual, ajustar tapas plástico
          document.getElementById("edit-tapas-plastico").value = nuevoTotalTapas - tapasMetalica
          document.getElementById("edit-tapas-metalica").value = tapasMetalica
        }
      })
    })

    // Simular un cambio inicial para actualizar los valores
    const tipoAjusteSeleccionado = document.querySelector('input[name="edit-tipo-ajuste"]:checked').value
    if (tipoAjusteSeleccionado === "plastico") {
      document.getElementById("edit-tapas-plastico").value = tapasPlastico
      document.getElementById("edit-tapas-metalica").value = nuevoTotalTapas - tapasPlastico
    } else {
      document.getElementById("edit-tapas-plastico").value = nuevoTotalTapas - tapasMetalica
      document.getElementById("edit-tapas-metalica").value = tapasMetalica
    }
  } else {
    // Si no hay cambio en el número de promociones, ocultar el ajuste
    ajusteContainer.style.display = "none"
  }
}

// Función para calcular cuando se modifica la cantidad de tapas plásticas
function calcularCambioTapasPlastico() {
  const nPromociones = Number.parseInt(document.getElementById("edit-n-promociones").value) || 0
  const totalTapas = nPromociones * TAPAS_POR_PROMOCION
  const tapasPlastico = Number.parseInt(document.getElementById("edit-tapas-plastico").value) || 0

  // Verificar que no se ingresen más tapas plásticas que el total
  if (tapasPlastico > totalTapas) {
    alert(`No puede ingresar más de ${totalTapas} tapas plásticas para ${nPromociones} promociones.`)
    document.getElementById("edit-tapas-plastico").value = totalTapas
    document.getElementById("edit-tapas-metalica").value = 0
    return
  }

  // Calcular tapas metálicas como la diferencia
  document.getElementById("edit-tapas-metalica").value = totalTapas - tapasPlastico
}

// Función para calcular cuando se modifica la cantidad de tapas metálicas
function calcularCambioTapasMetalica() {
  const nPromociones = Number.parseInt(document.getElementById("edit-n-promociones").value) || 0
  const totalTapas = nPromociones * TAPAS_POR_PROMOCION
  const tapasMetalica = Number.parseInt(document.getElementById("edit-tapas-metalica").value) || 0

  // Verificar que no se ingresen más tapas metálicas que el total
  if (tapasMetalica > totalTapas) {
    alert(`No puede ingresar más de ${totalTapas} tapas metálicas para ${nPromociones} promociones.`)
    document.getElementById("edit-tapas-metalica").value = totalTapas
    document.getElementById("edit-tapas-plastico").value = 0
    return
  }

  // Calcular tapas plásticas como la diferencia
  document.getElementById("edit-tapas-plastico").value = totalTapas - tapasMetalica
}

// Función para guardar los cambios del registro editado - MODIFICADA para usar ruta en lugar de id
async function guardarCambiosRegistro(e) {
  e.preventDefault()

  const id = document.getElementById("edit-record-id").value
  const originalRuta = document.getElementById("edit-original-ruta").value
  const ruta = document.getElementById("edit-ruta").value
  const nPromociones = Number.parseInt(document.getElementById("edit-n-promociones").value) || 0
  const tapasPlastico = Number.parseInt(document.getElementById("edit-tapas-plastico").value) || 0
  const tapasMetalica = Number.parseInt(document.getElementById("edit-tapas-metalica").value) || 0
  const totalTapas = Number.parseInt(document.getElementById("edit-total-tapas").value) || 0

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

  // Verificar si la ruta ya existe (solo si se cambió la ruta)
  if (ruta !== originalRuta) {
    const rutaExistente = registros.find((r) => r.ruta === ruta && r.id !== id)
    if (rutaExistente) {
      if (!confirm(`Ya existe un registro con la ruta ${ruta}. ¿Desea continuar?`)) {
        return
      }
    }
  }

  // Crear objeto con los datos actualizados
  const registroActualizado = {
    ruta,
    n_promociones: nPromociones,
    tapas_plastico: tapasPlastico,
    tapas_metalica: tapasMetalica,
    total_tapas: totalTapas,
  }

  try {
    // Mostrar indicador de carga
    const submitBtn = editForm.querySelector(".btn-submit")
    const originalText = submitBtn.textContent
    submitBtn.textContent = "Guardando..."
    submitBtn.disabled = true

    console.log(`Actualizando registro con ruta: ${originalRuta}`, registroActualizado)

    // Primero obtenemos los registros que coinciden con la ruta original
    const getUrl = `${API_URL}?ruta=${encodeURIComponent(originalRuta)}`
    const getResponse = await fetch(getUrl)

    if (!getResponse.ok) {
      throw new Error(`Error al buscar registros: ${getResponse.status} ${getResponse.statusText}`)
    }

    const matchingRecords = await getResponse.json()
    console.log(`Registros encontrados para actualizar:`, matchingRecords)

    if (matchingRecords.length === 0) {
      throw new Error(`No se encontró ningún registro con ruta: ${originalRuta}`)
    }

    // Actualizar cada registro encontrado (normalmente solo debería haber uno)
    for (const record of matchingRecords) {
      const recordId = record.id
      if (!recordId) {
        console.warn(`Registro sin ID, no se puede actualizar:`, record)
        continue
      }

      console.log(`Actualizando registro con ID: ${recordId}`)
      const updateResponse = await fetch(`${API_URL}/${recordId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registroActualizado),
      })

      if (!updateResponse.ok) {
        console.error(`Error al actualizar registro con ID ${recordId}:`, updateResponse)
        throw new Error(`Error al actualizar registro: ${updateResponse.status} ${updateResponse.statusText}`)
      }

      console.log(`Registro con ID ${recordId} actualizado con éxito`)
    }

    // Cerrar el modal
    modal.style.display = "none"

    // Recargar los registros desde la API
    await cargarRegistros()

    alert("Registro actualizado con éxito!")
  } catch (error) {
    console.error("Error al actualizar registro:", error)
    alert(`No se pudo actualizar el registro: ${error.message}`)
  } finally {
    // Restaurar el botón
    const submitBtn = editForm.querySelector(".btn-submit")
    submitBtn.textContent = "Guardar Cambios"
    submitBtn.disabled = false
  }
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

  // Verificar si la ruta ya existe
  const rutaExistente = registros.find((r) => r.ruta === ruta)
  if (rutaExistente) {
    if (!confirm(`Ya existe un registro con la ruta ${ruta}. ¿Desea actualizarlo?`)) {
      return
    }
    // Si el usuario confirma, eliminaremos el registro existente antes de crear uno nuevo
    await eliminarRegistro(ruta)
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

    console.log("Enviando nuevo registro:", nuevoRegistro)

    // Enviar datos a la API
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(nuevoRegistro),
    })

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log("Registro guardado con éxito:", data)

    // Recargar los registros desde la API
    await cargarRegistros()

    // Limpiar el formulario
    form.reset()
    document.getElementById("tapas_plastico").value = ""
    document.getElementById("tapas_metalica").value = ""
    document.getElementById("total_tapas").value = ""

    alert("Registro guardado con éxito!")
  } catch (error) {
    console.error("Error al guardar registro:", error)
    alert("No se pudo guardar el registro. Por favor, intente de nuevo más tarde.")
  } finally {
    // Restaurar el botón
    const submitBtn = form.querySelector(".btn-submit")
    submitBtn.textContent = "Guardar Registro"
    submitBtn.disabled = false
  }
}

// Función para eliminar un registro - MODIFICADA para usar ruta en lugar de id
async function eliminarRegistro(ruta) {
  if (!ruta) {
    console.error("Error: Ruta no válida para eliminar")
    alert("Error: No se pudo identificar el registro a eliminar")
    return
  }

  if (confirm(`¿Está seguro de que desea eliminar el registro con ruta ${ruta}?`)) {
    try {
      // Buscar todos los registros que coincidan con la ruta
      const registrosAEliminar = registros.filter((r) => r.ruta === ruta)

      if (registrosAEliminar.length === 0) {
        throw new Error(`No se encontró ningún registro con ruta: ${ruta}`)
      }

      console.log(`Encontrados ${registrosAEliminar.length} registros con ruta ${ruta}`)

      // Eliminar cada registro encontrado
      for (const registro of registrosAEliminar) {
        console.log(`Eliminando registro:`, registro)

        // Construir la URL para eliminar por ruta
        // Usamos un parámetro de consulta para filtrar por ruta
        const deleteUrl = `${API_URL}?ruta=${encodeURIComponent(ruta)}`
        console.log(`URL de eliminación: ${deleteUrl}`)

        // Primero obtenemos los registros que coinciden con la ruta
        const getResponse = await fetch(deleteUrl)

        if (!getResponse.ok) {
          throw new Error(`Error al buscar registros: ${getResponse.status} ${getResponse.statusText}`)
        }

        const matchingRecords = await getResponse.json()
        console.log(`Registros encontrados para eliminar:`, matchingRecords)

        // Eliminar cada registro encontrado
        for (const record of matchingRecords) {
          const recordId = record.id
          if (!recordId) {
            console.warn(`Registro sin ID, no se puede eliminar:`, record)
            continue
          }

          console.log(`Eliminando registro con ID: ${recordId}`)
          const deleteResponse = await fetch(`${API_URL}/${recordId}`, {
            method: "DELETE",
          })

          if (!deleteResponse.ok) {
            console.error(`Error al eliminar registro con ID ${recordId}:`, deleteResponse)
            throw new Error(`Error al eliminar registro: ${deleteResponse.status} ${deleteResponse.statusText}`)
          }

          console.log(`Registro con ID ${recordId} eliminado con éxito`)
        }
      }

      console.log("Todos los registros eliminados con éxito")

      // Actualizar la lista de registros
      await cargarRegistros()

      alert(`Registro(s) con ruta ${ruta} eliminado(s) con éxito`)
    } catch (error) {
      console.error("Error al eliminar registro:", error)
      alert(`No se pudo eliminar el registro: ${error.message}`)
    }
  }
}

// Event listeners
form.addEventListener("submit", agregarRegistro)
editForm.addEventListener("submit", guardarCambiosRegistro)

// Cerrar el modal cuando se hace clic en la X
closeModalBtn.addEventListener("click", () => {
  modal.style.display = "none"
})

// Cerrar el modal cuando se hace clic fuera del contenido
window.addEventListener("click", (event) => {
  if (event.target === modal) {
    modal.style.display = "none"
  }
})

// Inicializar la tabla al cargar la página
document.addEventListener("DOMContentLoaded", () => {
  console.log("Inicializando aplicación...")
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

  // Agregar event listener para el cambio de promociones en el formulario de edición
  document.getElementById("edit-n-promociones").addEventListener("input", calcularCambioPromociones)

  // Agregar event listeners para la edición directa de tapas
  document.getElementById("edit-tapas-plastico").addEventListener("input", calcularCambioTapasPlastico)
  document.getElementById("edit-tapas-metalica").addEventListener("input", calcularCambioTapasMetalica)
})
