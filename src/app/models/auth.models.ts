export interface UsuarioDTO {
    nick: string;
    pass: string;
}

export interface RespuestaSesionDTO {
    exito: boolean;
    mensaje: string;
    token: string;
    // Agrega aquí otros campos que devuelva tu DTO, ej: nombre, rol, etc.
}