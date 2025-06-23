DROP DATABASE IF EXISTS sistema_usuarios;
CREATE DATABASE IF NOT EXISTS sistema_usuarios;
USE sistema_usuarios;


--Después de ejecutar el back
INSERT INTO Administrador (Username_Admin, Password_Admin) VALUES ('admin', '1234');
INSERT INTO Usuario (Username, Email, Password) VALUES ('user1','email_generico@gmail.com', '123');
