export interface IGrainType {
    id: string;
    name: string;
    description: string;
}


export interface IGrainTypeResults {
    count: number;
    results: IGrainType[];
}
