export type TProductCategory = 'grain' | 'pesticide' | 'fertilizer' | 'seed' | 'other';
export type TUnitOfMeasure = 'kg' | 'litre' | 'tonne' | 'bag' | 'piece';

export interface IGrainType {
    id: string;
    name: string;
    description: string;
    /** Broad commodity category */
    product_category: TProductCategory;
    product_category_display: string;
    /** Unit used to measure quantity for this product */
    unit_of_measure: TUnitOfMeasure;
    unit_of_measure_display: string;
    /** Short abbreviation: kg, L, t, bag, pc */
    unit_label: string;
}

export interface IGrainTypeResults {
    count: number;
    results: IGrainType[];
}
