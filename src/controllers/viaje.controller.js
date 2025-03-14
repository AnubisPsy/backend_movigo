const { Sequelize } = require("sequelize");
const { Viajes, Usuarios, Estado, Vehiculo, InformacionConductor } =
  require("../models/init-models")(require("../config/database"));

const crearViaje = async (req, res) => {
  try {
    const { origen, destino } = req.body;
    const usuario_id = req.user.id;

    // Verificar que el usuario es un pasajero (rol 1)
    const usuario = await Usuarios.findOne({
      where: {
        id: usuario_id,
        rol: 1,
      },
    });

    if (!usuario) {
      return res.status(403).json({
        success: false,
        message: "Solo los pasajeros pueden crear viajes",
      });
    }

    // Crear el viaje
    const viaje = await Viajes.create({
      usuario_id,
      origen,
      destino,
      estado: 1, // ID del estado PENDIENTE
      created_at: new Date(),
      // Ya no usamos tiempo_cancelacion_expirado
      // tiempo_cancelacion_expirado: false,
      costo: 0,
    });

    // Timer para auto-cancelación (1 hora)
    setTimeout(async () => {
      const viajeActual = await Viajes.findByPk(viaje.id);
      if (viajeActual && viajeActual.estado === 1) {
        viajeActual.estado = 5; // CANCELADO
        viajeActual.fecha_fin = new Date();
        await viajeActual.save();
        console.log(`Viaje ${viaje.id}: Auto-cancelado por tiempo (1 hora)`);
      }
    }, 3600 * 1000); // 3600 segundos = 1 hora

    // Obtener el viaje con la información del estado
    const viajeConEstado = await Viajes.findOne({
      where: { id: viaje.id },
      include: [
        {
          model: Estado,
          attributes: ["id", "estado", "descripción"],
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: "Viaje creado exitosamente",
      data: viajeConEstado,
    });
  } catch (error) {
    console.error("Error al crear viaje:", error);
    res.status(500).json({
      success: false,
      message: "Error al crear viaje",
      error: error.message,
    });
  }
};

const obtenerViaje = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = req.user;

    // Verificar autenticación
    if (!usuario) {
      return res.status(401).json({
        success: false,
        message: "Usuario no autenticado",
      });
    }

    // Si se proporciona un ID, buscar un viaje específico
    if (id) {
      const viaje = await Viajes.findOne({
        where: { id },
        include: [
          {
            model: Estado,
            attributes: ["id", "estado", "descripción"],
          },
          {
            model: Usuarios,
            attributes: ["id", "nombre", "apellido", "email"],
          },
        ],
      });

      if (!viaje) {
        return res.status(404).json({
          success: false,
          message: "Viaje no encontrado",
        });
      }

      return res.json({
        success: true,
        data: viaje,
      });
    }

    let viajes;
    if (usuario.rol === "2") {
      viajes = await Viajes.findAll({
        where: { estado: 1 }, // Solo PENDIENTES
        include: [
          {
            model: Estado,
            attributes: ["id", "estado", "descripción"],
          },
          {
            model: Usuarios,
            attributes: ["id", "nombre", "apellido", "email"],
          },
        ],
      });
    } else {
      // Pasajero
      viajes = await Viajes.findAll({
        where: { usuario_id: usuario.id },
        include: [
          {
            model: Estado,
            attributes: ["id", "estado", "descripción"],
          },
          {
            model: Usuarios,
            attributes: ["id", "nombre", "apellido", "email"],
          },
        ],
      });
    }

    res.json({
      success: true,
      data: viajes,
    });
  } catch (error) {
    console.error("Error al obtener viaje(s):", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener viaje(s)",
      error: error.message,
    });
  }
};

const tomarViaje = async (req, res) => {
  try {
    const { id } = req.params; // ID del viaje
    const conductor = req.user;

    // Verificar que el usuario es conductor (rol '2')
    if (conductor.rol !== "2") {
      return res.status(403).json({
        success: false,
        message: "Solo los conductores pueden tomar viajes",
      });
    }

    // Verificar si existe información del conductor
    const conductorInfo = await InformacionConductor.findOne({
      where: { conductor_id: conductor.id },
      include: [
        {
          model: Vehiculo,
          required: true,
        },
      ],
    });

    if (!conductorInfo) {
      return res.status(400).json({
        success: false,
        message:
          "Debe completar su información de conductor antes de tomar viajes",
      });
    }

    // Buscar el viaje
    const viaje = await Viajes.findOne({
      where: {
        id,
        estado: 1, // Solo viajes PENDIENTES
      },
    });

    if (!viaje) {
      return res.status(404).json({
        success: false,
        message: "Viaje no encontrado o no disponible",
      });
    }

    // Actualizar el viaje
    await viaje.update({
      estado: 2, // ACEPTADO
      conductor_id: conductor.id,
      vehiculo_id: conductorInfo.Vehiculo.id,
      fecha_inicio: new Date(),
    });

    // Obtener el viaje actualizado con todas sus relaciones
    const viajeAceptado = await Viajes.findOne({
      where: { id },
      include: [
        {
          model: Estado,
          attributes: ["id", "estado", "descripción"],
        },
        {
          model: Usuarios,
          as: "Usuario",
          attributes: ["id", "nombre", "apellido", "email"],
        },
        {
          model: Usuarios,
          as: "Conductor",
          attributes: ["id", "nombre", "apellido", "email"],
        },
        {
          model: Vehiculo,
          attributes: ["id", "marca", "modelo", "año", "placa", "color"],
        },
      ],
    });

    // Emitir evento WebSocket con el nombre más descriptivo
    const io = req.app.get("socketio");
    if (io) {
      io.emit(`viaje-${viaje.usuario_id}`, {
        tipo: "viaje-aceptado",
        data: viajeAceptado,
      });
      console.log(
        `Evento viaje-aceptado emitido para usuario ${viaje.usuario_id}`
      );
    }

    // Enviar respuesta con el nombre más descriptivo
    res.json({
      success: true,
      message: "Viaje tomado exitosamente",
      data: viajeAceptado,
    });
  } catch (error) {
    console.error("Error al tomar viaje:", error);
    res.status(500).json({
      success: false,
      message: "Error al tomar viaje",
      error: error.message,
    });
  }
};

const iniciarViaje = async (req, res) => {
  try {
    const { id } = req.params; // ID del viaje
    const conductor = req.user;

    // Verificar que el usuario es conductor
    if (conductor.rol !== "2") {
      return res.status(403).json({
        success: false,
        message: "Solo los conductores pueden iniciar viajes",
      });
    }

    // Buscar el viaje
    const viaje = await Viajes.findOne({
      where: {
        id,
        estado: 2, // Solo viajes ACEPTADOS
        conductor_id: conductor.id, // Solo el conductor asignado
      },
      include: [
        {
          model: Estado,
          attributes: ["id", "estado", "descripción"],
        },
        {
          model: Usuarios,
          as: "Usuario",
          attributes: ["id", "nombre", "apellido", "email"],
        },
        {
          model: Usuarios,
          as: "Conductor",
          attributes: ["id", "nombre", "apellido", "email"],
        },
        {
          model: Vehiculo,
          attributes: ["id", "marca", "modelo", "año", "placa", "color"],
        },
      ],
    });

    if (!viaje) {
      return res.status(404).json({
        success: false,
        message: "Viaje no encontrado o no disponible para iniciar",
      });
    }

    // Crear fecha en zona horaria de Honduras
    const fechaInicioHN = new Date();
    // Ajustar a UTC-6 (Honduras)
    fechaInicioHN.setHours(fechaInicioHN.getHours() - 6);

    console.log("=== DEBUG INICIAR VIAJE ===");
    console.log("Fecha inicio (UTC):", fechaInicioHN.toISOString());
    console.log(
      "Hora inicio (HN):",
      fechaInicioHN.toLocaleString("es-HN", {
        timeZone: "America/Tegucigalpa",
        hour12: false,
      })
    );

    // Actualizar el estado del viaje
    await viaje.update({
      estado: 3, // EN_CURSO
      fecha_inicio: fechaInicioHN,
    });

    // Agregar después de viaje.update() en iniciarViaje
    const io = req.app.get("socketio");
    if (io) {
      io.emit(`viaje-${viaje.usuario_id}`, {
        tipo: "viaje-iniciado",
        data: viaje,
      });
      console.log(
        `Evento viaje-iniciado emitido para usuario ${viaje.usuario_id}`
      );
    }

    res.json({
      success: true,
      message: "Viaje iniciado exitosamente",
      data: viaje,
    });
  } catch (error) {
    console.error("Error al iniciar viaje:", error);
    res.status(500).json({
      success: false,
      message: "Error al iniciar viaje",
      error: error.message,
    });
  }
};

const completarViaje = async (req, res) => {
  try {
    const { id } = req.params;
    const conductor = req.user;

    // Verificar que el usuario es conductor
    if (conductor.rol !== "2") {
      return res.status(403).json({
        success: false,
        message: "Solo los conductores pueden completar viajes",
      });
    }

    // Buscar el viaje con toda la información necesaria
    const viaje = await Viajes.findOne({
      where: {
        id,
        estado: 3, // Solo viajes EN_CURSO
        conductor_id: conductor.id, // Solo el conductor asignado
      },
      include: [
        {
          model: Estado,
          attributes: ["id", "estado", "descripción"],
        },
        {
          model: Usuarios,
          as: "Usuario",
          attributes: ["id", "nombre", "apellido", "email"],
        },
        {
          model: Usuarios,
          as: "Conductor",
          attributes: ["id", "nombre", "apellido", "email"],
        },
        {
          model: Vehiculo,
          attributes: ["id", "marca", "modelo", "año", "placa", "color"],
        },
      ],
    });

    if (!viaje) {
      return res.status(404).json({
        success: false,
        message: "Viaje no encontrado o no disponible para completar",
      });
    }

    // Obtener la información del conductor para la tarifa
    const conductorInfo = await InformacionConductor.findOne({
      where: { conductor_id: conductor.id },
    });

    // Obtener fechas considerando la zona horaria de Honduras
    const fechaInicio = new Date(viaje.fecha_inicio);
    const fechaFin = new Date();

    // Configuración para Honduras
    const opcionesHN = {
      timeZone: "America/Tegucigalpa",
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    };

    // Debug detallado
    console.log("=== DEBUG completar VIAJE ===");
    console.log("Fecha inicio (raw):", viaje.fecha_inicio);
    console.log("Fecha inicio (parsed):", fechaInicio.toISOString());
    console.log("Fecha fin (raw):", fechaFin);
    console.log("Fecha fin (parsed):", fechaFin.toISOString());
    console.log(
      "Hora inicio (HN):",
      fechaInicio.toLocaleString("es-HN", opcionesHN)
    );
    console.log("Hora fin (HN):", fechaFin.toLocaleString("es-HN", opcionesHN));

    // Calcular duración usando timestamps para mayor precisión
    const duracionMinutos = Math.round(
      Math.abs(fechaFin.getTime() - fechaInicio.getTime()) / (1000 * 60)
    );
    console.log("Duración en minutos del viaje:", duracionMinutos);

    // Establecer un costo mínimo y calcular costo final
    const costoMinimo = conductorInfo.tarifa_base;
    const costo = Math.max(
      conductorInfo.tarifa_base * duracionMinutos,
      costoMinimo
    );
    const costoFinal = Math.round(costo * 100) / 100;

    // Actualizar el viaje usando el timestamp UTC
    await viaje.update({
      estado: 4, // COMPLETADO
      fecha_fin: new Date(fechaFin).toISOString(),
      costo: costoFinal,
    });

    // Obtener el viaje completado
    const viajeCompletado = await Viajes.findOne({
      where: { id },
      include: [
        {
          model: Estado,
          attributes: ["id", "estado", "descripción"],
        },
        {
          model: Usuarios,
          as: "Usuario",
          attributes: ["id", "nombre", "apellido", "email"],
        },
        {
          model: Usuarios,
          as: "Conductor",
          attributes: ["id", "nombre", "apellido", "email"],
        },
        {
          model: Vehiculo,
          attributes: ["id", "marca", "modelo", "año", "placa", "color"],
        },
      ],
    });

    // Emitir evento WebSocket
    const io = req.app.get("socketio");
    if (io) {
      io.emit(`viaje-${viaje.usuario_id}`, {
        tipo: "viaje-completado",
        data: {
          ...viajeCompletado.toJSON(),
          duracion_minutos: duracionMinutos,
        },
      });
      console.log(
        `Evento viaje-completado emitido para usuario ${viaje.usuario_id}`
      );
    }

    res.json({
      success: true,
      message: "Viaje finalizado exitosamente",
      data: {
        ...viajeCompletado.toJSON(),
        duracion_minutos: duracionMinutos,
      },
    });
  } catch (error) {
    console.error("Error al completar viaje:", error);
    res.status(500).json({
      success: false,
      message: "Error al completar viaje",
      error: error.message,
    });
  }
};

const obtenerHistorial = async (req, res) => {
  try {
    const usuario = req.user;
    console.log("=== DEBUG HISTORIAL ===");
    console.log("Usuario ID:", usuario.id);
    console.log("Rol de usuario:", usuario.rol);

    let viajes;

    // Configurar opciones para el formato de hora Honduras
    const opcionesHN = {
      timeZone: "America/Tegucigalpa",
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    };

    if (usuario.rol === "1") {
      // Pasajero
      console.log("Obteniendo historial para PASAJERO");

      // Quitar el filtro de estado para mostrar todos los viajes
      viajes = await Viajes.findAll({
        where: {
          usuario_id: usuario.id,
          // Eliminar la condición "estado: 4" para obtener todos los estados
        },
        include: [
          {
            model: Usuarios,
            as: "Usuario", // Incluir el pasajero
            attributes: ["nombre", "apellido"],
          },
          {
            model: Usuarios,
            as: "Conductor", // Importante: incluir al conductor
            attributes: ["nombre", "apellido"],
            required: false, // Hacerlo opcional para viajes sin conductor asignado
          },
          {
            model: Vehiculo,
            attributes: ["marca", "modelo", "año", "placa", "color"],
            required: false, // Hacerlo opcional
          },
          {
            model: Estado,
            attributes: ["id", "estado", "descripción"],
          },
        ],
        order: [["created_at", "DESC"]], // Ordenar por fecha de creación en lugar de inicio
      });

      console.log("Viajes encontrados:", viajes.length);

      // Formatear datos para pasajero (modificado para todos los estados)
      const historialPasajero = viajes.map((viaje) => {
        // Crear objeto base con más información sobre el estado
        const viajeFormateado = {
          id: viaje.id,
          fecha: viaje.created_at
            ? new Date(viaje.created_at).toLocaleDateString("es-HN")
            : "Fecha no disponible",
          estado: viaje.Estado ? viaje.Estado.estado : "Estado desconocido",
          estado_id: viaje.estado,
          origen: viaje.origen,
          destino: viaje.destino,
          costo: viaje.costo || 0,
        };

        // Añadir información de hora inicio/fin solo si están disponibles
        if (viaje.fecha_inicio) {
          viajeFormateado.hora_inicio = new Date(
            viaje.fecha_inicio
          ).toLocaleTimeString("es-HN", opcionesHN);
        }

        if (viaje.fecha_fin) {
          viajeFormateado.hora_fin = new Date(
            viaje.fecha_fin
          ).toLocaleTimeString("es-HN", opcionesHN);
        }

        // Añadir información del conductor si existe
        if (viaje.Conductor) {
          viajeFormateado.conductor = `${viaje.Conductor.nombre} ${viaje.Conductor.apellido}`;
        } else {
          viajeFormateado.conductor = "Sin conductor asignado";
        }

        // Añadir información del vehículo si existe
        if (viaje.Vehiculo) {
          viajeFormateado.vehiculo = `${viaje.Vehiculo.marca} ${viaje.Vehiculo.modelo} - ${viaje.Vehiculo.placa} (${viaje.Vehiculo.color})`;
        } else {
          viajeFormateado.vehiculo = "Vehículo no asignado";
        }

        return viajeFormateado;
      });

      return res.json({
        success: true,
        data: historialPasajero,
      });
    } else if (usuario.rol === "2") {
      // Conductor - aplicar la misma lógica pero con conductor_id
      viajes = await Viajes.findAll({
        where: {
          conductor_id: usuario.id,
          // Eliminar la condición "estado: 4" para obtener todos
        },
        include: [
          {
            model: Usuarios,
            as: "Usuario", // Incluir el usuario (pasajero)
            attributes: ["nombre", "apellido"],
          },
          {
            model: Vehiculo,
            attributes: ["marca", "modelo", "año", "placa", "color"],
            required: false,
          },
          {
            model: Estado,
            attributes: ["id", "estado", "descripción"],
          },
        ],
        order: [["created_at", "DESC"]],
      });

      // Formatear datos para conductor (adaptado a todos los estados)
      const historialConductor = viajes.map((viaje) => ({
        id: viaje.id,
        fecha: viaje.created_at
          ? new Date(viaje.created_at).toLocaleDateString("es-HN")
          : "Fecha no disponible",
        estado: viaje.Estado ? viaje.Estado.estado : "Estado desconocido",
        estado_id: viaje.estado,
        pasajero: viaje.Usuario
          ? `${viaje.Usuario.nombre} ${viaje.Usuario.apellido}`
          : "Pasajero desconocido",
        origen: viaje.origen,
        destino: viaje.destino,
        costo: viaje.costo || 0,
        hora_inicio: viaje.fecha_inicio
          ? new Date(viaje.fecha_inicio).toLocaleTimeString("es-HN", opcionesHN)
          : "No iniciado",
        hora_fin: viaje.fecha_fin
          ? new Date(viaje.fecha_fin).toLocaleTimeString("es-HN", opcionesHN)
          : "No finalizado",
        vehiculo: viaje.Vehiculo
          ? `${viaje.Vehiculo.marca} ${viaje.Vehiculo.modelo} - ${viaje.Vehiculo.placa} (${viaje.Vehiculo.color})`
          : "Vehículo no asignado",
      }));

      return res.json({
        success: true,
        data: historialConductor,
      });
    }
  } catch (error) {
    console.error("Error al obtener historial:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener historial",
      error: error.message,
    });
  }
};

const cancelarViaje = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = req.user;

    // Buscar el viaje
    const viaje = await Viajes.findOne({
      where: {
        id,
        usuario_id: usuario.id, // Solo el creador puede cancelar
        estado: 1, // Solo viajes PENDIENTES
      },
    });

    if (!viaje) {
      return res.status(404).json({
        success: false,
        message: "Viaje no encontrado o no disponible para cancelar",
      });
    }

    // Actualizar el estado del viaje
    await viaje.update({
      estado: 5, // CANCELADO
      fecha_fin: new Date(),
    });

    // Después de actualizar el estado del viaje en cancelarViaje
    const io = req.app.get("socketio");
    if (io) {
      io.emit(`viaje-${viaje.usuario_id}`, {
        tipo: "viaje-cancelado",
        data: viaje,
      });
      console.log(
        `Evento viaje-cancelado emitido para usuario ${viaje.usuario_id}`
      );
    }

    res.json({
      success: true,
      message: "Viaje cancelado exitosamente",
    });
  } catch (error) {
    console.error("Error al cancelar viaje:", error);
    res.status(500).json({
      success: false,
      message: "Error al cancelar viaje",
      error: error.message,
    });
  }
};

module.exports = {
  crearViaje,
  obtenerViaje,
  tomarViaje,
  iniciarViaje,
  completarViaje,
  obtenerHistorial,
  cancelarViaje,
};
