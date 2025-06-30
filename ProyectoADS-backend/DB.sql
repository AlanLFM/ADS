DROP DATABASE IF EXISTS sistema_usuarios;
CREATE DATABASE IF NOT EXISTS sistema_usuarios;
USE sistema_usuarios;

-- Tabla de Administradores
CREATE TABLE Administrador (
    Id_Admin INT AUTO_INCREMENT PRIMARY KEY,
    Username_Admin VARCHAR(50) NOT NULL,
    Password_Admin VARCHAR(100) NOT NULL
);

-- Tabla de Usuarios
CREATE TABLE Usuario (
    Id_Usuario INT AUTO_INCREMENT PRIMARY KEY,
    Username VARCHAR(50) NOT NULL,
    Email VARCHAR(50) NOT NULL,
    Password VARCHAR(100) NOT NULL,
    
    -- Vinculación con Google
    Google_UID VARCHAR(100), -- UID persistente de Firebase/Google
    Google_AccessToken TEXT, -- Token temporal para Google APIs
    Google_Token_Expiracion DATETIME, -- Fecha de expiración del token
    URL_Foto TEXT,
    Google_email TEXT,

    -- Vinculación con Microsoft (opcional para Teams)
    Microsoft_UID VARCHAR(100), -- ID de cuenta Microsoft
    Microsoft_email Varchar(100),
    Microsoft_AccessToken TEXT,
    Microsoft_RefreshToken TEXT,
    Microsoft_Token_Expiracion DATETIME,

    Id_Admin INT,
    FOREIGN KEY (Id_Admin) REFERENCES Administrador(Id_Admin)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);


-- Tabla de Tareas
CREATE TABLE Tareas (
    Id_Tarea INT AUTO_INCREMENT PRIMARY KEY,
    Titulo_tarea VARCHAR(100) NOT NULL,
    Contenido TEXT,
    Id_Usuario INT,
    Sistema varchar(50) null,
    Curso varchar(100) null,
    FOREIGN KEY (Id_Usuario) REFERENCES Usuario(Id_Usuario)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);


INSERT INTO Administrador (Username_Admin, Password_Admin) VALUES ('admin', '1234');
INSERT INTO Usuario (Username, Email, Password) VALUES ('user1','email_generico@gmail.com', '123');
insert into usuario (username,email,password) values ('alan','alan@gmail.com', '123');
