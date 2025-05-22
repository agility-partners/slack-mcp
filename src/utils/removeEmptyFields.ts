export function removeEmptyFields(obj: Record<string, any>) {
  Object.keys(obj).forEach(key => {
    const val = obj[key];
    if (
      (typeof val === "object" && val !== null && !Array.isArray(val) && Object.keys(val).length === 0) ||
      (Array.isArray(val) && val.length === 0)
    ) {
      delete obj[key];
    }
  });
}
