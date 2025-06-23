const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');

// MODELO ADMINISTRADOR
const Administrador = sequelize.define('Administrador', {
  Id_Admin: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  Username_Admin: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  Password_Admin: {
    type: DataTypes.STRING(100),
    allowNull: false
  }
}, {
  tableName: 'Administrador',
  timestamps: false
});

// MODELO USUARIO
const Usuario = sequelize.define('Usuario', {
  Id_Usuario: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  Username: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  Email: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  Password: {
    type: DataTypes.STRING(100),
    allowNull: false
  },

  //  Google
  Google_UID: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  Google_AccessToken: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  Google_Token_Expiracion: {
    type: DataTypes.DATE,
    allowNull: true
  },
  URL_Foto: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  Google_email: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  

  //  Microsoft
  Microsoft_ID: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  Microsoft_AccessToken: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  Microsoft_Token_Expiracion: {
    type: DataTypes.DATE,
    allowNull: true
  }

}, {
  tableName: 'Usuario',
  timestamps: false
});


// MODELO TAREAS
const Tareas = sequelize.define('Tareas', {
  Id_Tarea: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  Titulo_tarea: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  Contenido: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'Tareas',
  timestamps: false
});

// RELACIONES
Administrador.hasMany(Usuario, {
  foreignKey: 'Id_Admin'
});
Usuario.belongsTo(Administrador, {
  foreignKey: 'Id_Admin'
});

Usuario.hasMany(Tareas, {
  foreignKey: 'Id_Usuario'
});
Tareas.belongsTo(Usuario, {
  foreignKey: 'Id_Usuario'
});

// Sincronizar modelos con la base de datos
sequelize.sync()
  .then(() => {
    console.log('Tablas sincronizadas correctamente');
  })
  .catch((err) => {
    console.error('Error al sincronizar tablas:', err);
  });

module.exports = { Administrador, Usuario, Tareas };
