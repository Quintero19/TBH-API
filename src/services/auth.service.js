const bcrypt = require('bcryptjs');
const generarToken = require('../utils/generarToken');
const { Usuarios, Roles } = require('../models');

exports.register = async (data) => {
  const { Documento, Correo, Password } = data;

  const rol_id = 2; // Asignar rol_id por defecto a 2 (Usuario)
  const estado = 0; // Asignar estado por defecto a 0 (Inactivo)

  try {
    if (!Documento) {
      throw new Error('El campo documento es obligatorio');
    }
    if (!Correo) {
      throw new Error('El campo correo es obligatorio');
    }

    const usuarioExistenteDocumento = await Usuarios.findOne({ where: { Documento } });
    if (usuarioExistenteDocumento) {
      throw new Error('El documento ya está registrado');
    }

    const usuarioExistenteCorreo = await Usuarios.findOne({ where: { Correo } });

    if (usuarioExistenteCorreo) {
      throw new Error('El correo ya está registrado');
    }

    const rolExistente = await Roles.findByPk(rol_id);
    if (!rolExistente) {
      throw new Error('Rol no encontrado');
    }

    const hashedPassword = await bcrypt.hash(Password, 10);

    const nuevoUsuario = await Usuarios.create({
      Documento: Documento,
      Password: hashedPassword,
      Correo: Correo,
      Estado: estado,
      Rol_Id: rol_id,
    });

    const token = generarToken(nuevoUsuario);

    return {
      status: 201,
      data: {
        usuario: nuevoUsuario,
        token,
      }
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

  
  exports.login = async (data) => {
    const { Documento, Correo, Password } = data;

  
    try {
      let usuario;

      if (Documento) {
        usuario = await Usuarios.findOne({ where: { Documento } });
      } else if (Correo) {
        usuario = await Usuarios.findOne({ where: { Correo } });

      }
  
      if (!usuario) {
        throw new Error('Credenciales incorrectas');
      }
  
      const esContraseñaValida = await bcrypt.compare(Password, usuario.Password);
      if (!esContraseñaValida) {
        throw new Error('Credenciales incorrectas');
      }
  
      const token = generarToken(usuario);
  
      return {
        status: 200,
        data: {
          usuario,
          token,
        },
      };
    } catch (error) {
      throw new Error(error.message);
    }
  };
