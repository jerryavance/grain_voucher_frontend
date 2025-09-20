export interface IQualityGrade {
    id: string;
    name: string;
    min_moisture: number;
    max_moisture: number;
    description: string;
}


export interface IQualityGradeResults {
    count: number;
    results: IQualityGrade[];
}
