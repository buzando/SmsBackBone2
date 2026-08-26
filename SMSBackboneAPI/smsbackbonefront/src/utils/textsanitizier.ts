export const removeAccents = (value: string): string => {
  return value
    .replace(/[áàäâ]/g, 'a')
    .replace(/[ÁÀÄÂ]/g, 'A')
    .replace(/[éèëê]/g, 'e')
    .replace(/[ÉÈËÊ]/g, 'E')
    .replace(/[íìïî]/g, 'i')
    .replace(/[ÍÌÏÎ]/g, 'I')
    .replace(/[óòöô]/g, 'o')
    .replace(/[ÓÒÖÔ]/g, 'O')
    .replace(/[úùüû]/g, 'u')
    .replace(/[ÚÙÜÛ]/g, 'U');
};