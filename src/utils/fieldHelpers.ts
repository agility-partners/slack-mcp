// Helper to keep only {id} for object fields
export const idOnly = (obj: any) =>
  obj && typeof obj === "object" && "id" in obj ? { id: obj.id } : obj;

// Helper for arrays of {id}
export const idOnlyArray = (arr: any[]) =>
  Array.isArray(arr) ? arr.filter(i => i && "id" in i).map(i => ({ id: i.id })) : arr;

// Helper for customFields: keep {id, value}
export const customFieldsArray = (arr: any[]) =>
  Array.isArray(arr) ? arr.filter(i => i && "id" in i).map(i => ({ id: i.id, value: i.value })) : arr;
