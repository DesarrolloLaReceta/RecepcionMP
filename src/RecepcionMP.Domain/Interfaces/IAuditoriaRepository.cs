using RecepcionMP.Domain.Entities;

namespace RecepcionMP.Domain.Interfaces;

public interface IAuditoriaRepository
{
    Task RegistrarAsync(RegistroAuditoria auditoria);
}
