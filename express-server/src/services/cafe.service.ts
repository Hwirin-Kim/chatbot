import { CafeData, Menu, BusinessHours, Facilities } from "../types/cafe.types";
import cafeData from "../data/cafe.json";

class CafeService {
  private readonly data: CafeData = cafeData;

  getAllMenu(): Menu {
    return this.data.menu;
  }

  getAvailableMenu(): Menu {
    const availableMenu: Menu = {
      coffee: this.data.menu.coffee.filter((item) => item.isAvailable),
      tea: this.data.menu.tea.filter((item) => item.isAvailable),
      beverage: this.data.menu.beverage.filter((item) => item.isAvailable),
      dessert: this.data.menu.dessert.filter((item) => item.isAvailable),
    };
    return availableMenu;
  }

  getBusinessHours(): BusinessHours {
    return this.data.businessHours;
  }

  getFacilities(): Facilities {
    return this.data.facilities;
  }
}

export const cafeService = new CafeService();
