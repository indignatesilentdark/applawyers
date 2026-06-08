export type CountryOption = {
  dialCode: string;
  flag: string;
  isoCode: string;
  name: string;
};

export const COUNTRY_OPTIONS: CountryOption[] = [
  { name: "Argentina", dialCode: "+54", flag: "🇦🇷", isoCode: "AR" },
  { name: "Bolivia", dialCode: "+591", flag: "🇧🇴", isoCode: "BO" },
  { name: "Brasil", dialCode: "+55", flag: "🇧🇷", isoCode: "BR" },
  { name: "Chile", dialCode: "+56", flag: "🇨🇱", isoCode: "CL" },
  { name: "Colombia", dialCode: "+57", flag: "🇨🇴", isoCode: "CO" },
  { name: "Costa Rica", dialCode: "+506", flag: "🇨🇷", isoCode: "CR" },
  { name: "Cuba", dialCode: "+53", flag: "🇨🇺", isoCode: "CU" },
  { name: "Ecuador", dialCode: "+593", flag: "🇪🇨", isoCode: "EC" },
  { name: "Espana", dialCode: "+34", flag: "🇪🇸", isoCode: "ES" },
  { name: "El Salvador", dialCode: "+503", flag: "🇸🇻", isoCode: "SV" },
  { name: "Estados Unidos", dialCode: "+1", flag: "🇺🇸", isoCode: "US" },
  { name: "Guatemala", dialCode: "+502", flag: "🇬🇹", isoCode: "GT" },
  { name: "Haiti", dialCode: "+509", flag: "🇭🇹", isoCode: "HT" },
  { name: "Honduras", dialCode: "+504", flag: "🇭🇳", isoCode: "HN" },
  { name: "Mexico", dialCode: "+52", flag: "🇲🇽", isoCode: "MX" },
  { name: "Nicaragua", dialCode: "+505", flag: "🇳🇮", isoCode: "NI" },
  { name: "Panama", dialCode: "+507", flag: "🇵🇦", isoCode: "PA" },
  { name: "Paraguay", dialCode: "+595", flag: "🇵🇾", isoCode: "PY" },
  { name: "Peru", dialCode: "+51", flag: "🇵🇪", isoCode: "PE" },
  { name: "Uruguay", dialCode: "+598", flag: "🇺🇾", isoCode: "UY" },
  { name: "Venezuela", dialCode: "+58", flag: "🇻🇪", isoCode: "VE" },
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
