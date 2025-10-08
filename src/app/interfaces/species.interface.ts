export interface Species {
  id?: number;
  engName: string;
  afcName: string;
  status: string;
  category_id?: number;
  categoryName?: string;
}

export interface SpeciesCategory {
  id?: number;
  name: string;
}