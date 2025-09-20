import { FC } from "react";
import { Small } from "../Typography";

interface IStatusBtnProps {
    title: string;
    type: string | number;
    className?: string;
}

const StatusBtn: FC<IStatusBtnProps> = ({ title, type, ...rest }: any) => {
    return (
        <Small sx={[styles.badge, styles[type]]} {...rest}>
            {title}
        </Small>
    )
}

const styles: any = {
    badge: {
        lineHeight: 1.5,
        borderRadius: "1.03125rem",
        padding: "0.25rem 0.625rem",
        border: "0.0625rem solid transparent",
        cursor: "pointer",
    },
    '0': {
        color: "#f72b50",
        backgroundColor: "#fee6ea",
    },
    '1': {
        color: "#44814E",
        backgroundColor: "#44814e1a",
    },
    '2': {
        color: "#f7962b",
        backgroundColor: "#fef4e6",
    },
    '3': {
        color: "#44814E",
        backgroundColor: "#44814e1a",
    },
    '4': {
        color: "#626563",
        backgroundColor: "#626b631a",
    },
    '5': {
        color: "#f72b50",
        backgroundColor: "#fee6ea",
    },
    '6': {
        color: "#f72b50",
        backgroundColor: "#fee6ea",
    },

}

export default StatusBtn;
