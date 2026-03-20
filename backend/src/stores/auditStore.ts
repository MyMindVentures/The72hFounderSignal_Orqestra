import { AuditEvent } from '../models';

const auditEvents = new Map<string, AuditEvent>();

export const auditStore = {
  add(event: AuditEvent) {
    auditEvents.set(event.id, event);
  },
  getAll(): AuditEvent[] {
    return Array.from(auditEvents.values()).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  },
  getById(id: string): AuditEvent | undefined {
    return auditEvents.get(id);
  }
};

export { auditEvents };

