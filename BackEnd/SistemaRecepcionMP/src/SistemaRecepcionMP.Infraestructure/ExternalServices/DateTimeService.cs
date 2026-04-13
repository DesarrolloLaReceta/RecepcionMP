using SistemaRecepcionMP.Application.Common.Interfaces;

namespace SistemaRecepcionMP.Infrastructure.Services; // O la carpeta que elijas

public class DateTimeService : IDateTime
{
    public DateTime Now 
    {
        get
        {
            // Definimos explícitamente la zona horaria de Colombia
            var zonaColombia = TimeZoneInfo.FindSystemTimeZoneById("SA Pacific Standard Time");
            
            // Convertimos la hora UTC actual a la hora de Colombia
            return TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, zonaColombia);
        }
    }
}