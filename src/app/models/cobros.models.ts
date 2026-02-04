export interface CobroListaDTO {
    id: number;
    fecReg: string;      // DateTime en C# llega como string ISO
    nombre: string;
    direccion: string;
    telefono: string;
    monto: number;       // decimal en C# es number en TS
    fecCaduca: string;
    isenviado: boolean;
    ispagado: boolean;
}

export interface CobroDTO {
    // Usamos PascalCase para coincidir con el DTO de C#
    id: number;
    nombre: string;
    direccion: string;
    telefono: string;
    monto: number;
    fecCaduca: string; 
    isenviado: boolean;
    ispagado: boolean;
}

export interface CobroPaginadoDto extends CobroDTO {
    // Agregamos FecReg que solo viene en este DTO
    fecReg: string;
}

export interface RespuestaCobrosPaginados {
    // Coincide con tu clase RespuestaCobrosPaginados en C#
    totalRegistros: number;
    listaCobros: CobroPaginadoDto[];
}

export interface RespuestaOperacionDTO {
    exito: boolean;
    mensaje: string;
    registrosafectados?: number;
}
