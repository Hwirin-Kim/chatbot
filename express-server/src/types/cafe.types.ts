export interface CafeInfo {
  name: string;
  address: string;
  phone: string;
  sns: {
    instagram: string;
    kakao_channel: string;
  };
}

export interface BusinessHours {
  regular: {
    [key: string]: { open: string; close: string };
  };
  holidays: Array<{
    date: string;
    description: string;
  }>;
  specialNotes: string;
}

export interface MenuItem {
  name: string;
  price: number;
  isAvailable: boolean;
  category: string;
  options?: {
    hot: boolean;
    ice: boolean;
  };
}

export interface Menu {
  coffee: MenuItem[];
  tea: MenuItem[];
  beverage: MenuItem[];
  dessert: MenuItem[];
}

export interface Facilities {
  parking: {
    available: boolean;
    description: string;
  };
  wifi: {
    available: boolean;
    name: string;
    password: string;
  };
  seats: {
    total: number;
    tables: {
      [key: string]: number;
    };
  };
}

export interface CafeData {
  cafeInfo: CafeInfo;
  businessHours: BusinessHours;
  menu: Menu;
  facilities: Facilities;
}
