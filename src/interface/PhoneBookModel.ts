export interface PhoneBook {
  id?: number;
  selectedCompanyId: number;
  company: string;
  firstName: string;
  lastName: string;
  mobile: string;
  email: string;
  companyPhone?: string;
  companyAddress?: string;
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

export interface PhoneBookCompany {
  phoneBooks: PhoneBook[];
  companies: Company[];
  cities: City[];
}