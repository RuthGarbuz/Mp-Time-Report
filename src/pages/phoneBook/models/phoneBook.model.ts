export interface PhoneBook {
  id: number;
  firstName: string;
  lastName: string;
  company: string;
  companyAddress: string;
  companyPhone: string;
  mobile: string;
  email: string;
  selectedCompanyId: number;
  companyCityID?: number;
}

export interface Company {
  id: number;
  name: string;
  address: string;
  phoneNum: string;
  cityID?: number;
}

export interface City {
  id: number;
  name: string;
}

export interface PhoneBookData {
  phoneBooks: PhoneBook[];
  companies: Company[];
  cities: City[];
}

export const createInitialContact = (): PhoneBook => ({
  id: 0,
  firstName: '',
  lastName: '',
  company: '',
  companyAddress: '',
  companyPhone: '',
  mobile: '',
  email: '',
  selectedCompanyId: 0,
  companyCityID: undefined
});

export const normalizeForWhatsApp = (raw?: string | null): string | null => {
  if (!raw) return null;

  let digits = raw.replace(/\D/g, "");

  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("972")) digits = digits.slice(3);
  if (digits.startsWith("0")) digits = digits.slice(1);

  digits = "972" + digits;

  if (!/^\d{11,12}$/.test(digits)) return null;

  return digits;
};
