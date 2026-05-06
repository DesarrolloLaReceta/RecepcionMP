export const AD_GROUPS = {
  CALIDAD: "App_Calidad_LE",
  RECIBO: "App_Recibo",
  ADMINISTRATIVO: "Administrativo_LE",
} as const;

export type AdGroup = (typeof AD_GROUPS)[keyof typeof AD_GROUPS];

export const ALL_AD_GROUPS: AdGroup[] = Object.values(AD_GROUPS);
