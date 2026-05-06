namespace SistemaRecepcionMP.Domain.Constants;

public static class ActiveDirectoryGroups
{
    public const string AppCalidad = "App_Calidad_LE";
    public const string AppRecibo = "App_Recibo";
    public const string Administrativo = "Administrativo_LE";

    public static readonly string[] Allowed = [AppCalidad, AppRecibo, Administrativo];
}
