import { FC } from "react";
import { IFormatFigureProps, figureFormatter } from "../../utils/figure_formatter";
import { Typography } from "@mui/material";

const FormatFigure: FC<IFormatFigureProps> = (props) => {
    return (
        <Typography display={'inline-block'} variant="h6" fontWeight={'bold'} color={props.figure < 0 ? 'error' : (props.color || 'primary')}>{figureFormatter(props)}</Typography>
    )
}

export default FormatFigure;