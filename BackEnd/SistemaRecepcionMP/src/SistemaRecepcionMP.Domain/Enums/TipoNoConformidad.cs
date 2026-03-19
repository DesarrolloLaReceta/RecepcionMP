namespace SistemaRecepcionMP.Domain.Enums;

public enum TipoNoConformidad
{
    Merma                  = 0,
    RechazoParcial         = 1,
    RechazoTotal           = 2,
    Cuarentena             = 3,
    TemperaturaFueraRango  = 4,
    RotuladoNoConforme     = 5,
    DocumentacionIncompleta = 6,
    CalidadSensorial       = 7,
    Otro                   = 8,
}
