const { Sequelize } = require('sequelize'); 
const config = require('./config'); 
const sequelize = new Sequelize(config.development);
async function testConnection() {   
try {     
      await sequelize.authenticate();
      console.log('CONEXION EXITOSA BD');
} catch (error) {
      console.error('CONEXION FALLIDA BASE DE DATOS', error);
   }
}
testConnection();
  
module.exports = sequelize;