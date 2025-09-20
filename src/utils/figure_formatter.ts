export interface IFormatFigureProps {
    figure: any;
    decimalPlaces?: number;
    currency?: string;
    color?: string;
}


export const figureFormatter = (payload: IFormatFigureProps) => {
    if(payload.figure === undefined || payload.figure === null) return '';

    const formattedFigure = Number(payload.figure).toFixed(payload?.decimalPlaces);

    const commaFormattedFigure = formattedFigure.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    return `${payload.currency ? payload.currency : ''} ${commaFormattedFigure}`;
}