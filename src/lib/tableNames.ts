export const tables = {
  users: 'ser_users',
  services: 'ser_services',
  requests: 'ser_requests',
  documents: 'ser_documents',
  payments: 'ser_payments',
} as const;

export type TableName = keyof typeof tables;

export const tbl = (name: TableName): string => {
  return tables[name];
};

export default {
  tables,
  tbl,
};
