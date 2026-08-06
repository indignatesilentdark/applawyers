export type CountryOption = {
  dialCode: string;
  flag: string;
  isoCode: string;
  phoneDigits: number;
  name: string;
};

export const COUNTRY_OPTIONS: CountryOption[] = [
  { name: "Argentina", dialCode: "+54", flag: "🇦🇷", isoCode: "AR", phoneDigits: 10 },
  { name: "Bolivia", dialCode: "+591", flag: "🇧🇴", isoCode: "BO", phoneDigits: 8 },
  { name: "Brasil", dialCode: "+55", flag: "🇧🇷", isoCode: "BR", phoneDigits: 11 },
  { name: "Chile", dialCode: "+56", flag: "🇨🇱", isoCode: "CL", phoneDigits: 9 },
  { name: "Colombia", dialCode: "+57", flag: "🇨🇴", isoCode: "CO", phoneDigits: 10 },
  { name: "Costa Rica", dialCode: "+506", flag: "🇨🇷", isoCode: "CR", phoneDigits: 8 },
  { name: "Cuba", dialCode: "+53", flag: "🇨🇺", isoCode: "CU", phoneDigits: 8 },
  { name: "Ecuador", dialCode: "+593", flag: "🇪🇨", isoCode: "EC", phoneDigits: 9 },
  { name: "Espana", dialCode: "+34", flag: "🇪🇸", isoCode: "ES", phoneDigits: 9 },
  { name: "El Salvador", dialCode: "+503", flag: "🇸🇻", isoCode: "SV", phoneDigits: 8 },
  { name: "Estados Unidos", dialCode: "+1", flag: "🇺🇸", isoCode: "US", phoneDigits: 10 },
  { name: "Guatemala", dialCode: "+502", flag: "🇬🇹", isoCode: "GT", phoneDigits: 8 },
  { name: "Haiti", dialCode: "+509", flag: "🇭🇹", isoCode: "HT", phoneDigits: 8 },
  { name: "Honduras", dialCode: "+504", flag: "🇭🇳", isoCode: "HN", phoneDigits: 8 },
  { name: "Mexico", dialCode: "+52", flag: "🇲🇽", isoCode: "MX", phoneDigits: 10 },
  { name: "Nicaragua", dialCode: "+505", flag: "🇳🇮", isoCode: "NI", phoneDigits: 8 },
  { name: "Panama", dialCode: "+507", flag: "🇵🇦", isoCode: "PA", phoneDigits: 8 },
  { name: "Paraguay", dialCode: "+595", flag: "🇵🇾", isoCode: "PY", phoneDigits: 9 },
  { name: "Peru", dialCode: "+51", flag: "🇵🇪", isoCode: "PE", phoneDigits: 9 },
  { name: "Uruguay", dialCode: "+598", flag: "🇺🇾", isoCode: "UY", phoneDigits: 8 },
  { name: "Venezuela", dialCode: "+58", flag: "🇻🇪", isoCode: "VE", phoneDigits: 10 },
];

export function findCountryOption(countryName?: string | null) {
  if (!countryName) {
    return null;
  }

  return COUNTRY_OPTIONS.find((option) => option.name === countryName) ?? null;
}

export function findCountryNameByIsoCode(isoCode?: string | null) {
  if (!isoCode) {
    return undefined;
  }

  return COUNTRY_OPTIONS.find((option) => option.isoCode === isoCode)?.name;
}
