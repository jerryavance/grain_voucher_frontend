import { FC } from "react";
import { Small } from "../Typography";

interface ILoanStatusBtnProps {
    title: string;
    type: string | number;
}

const LoanScheduleStatusBtn: FC<ILoanStatusBtnProps> = ({ title, type, ...rest }: any) => {
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
    '3': {
        color: "#2b8af7",
        backgroundColor: "#e6f2fe",
    },
    '2': {
        color: "#44814E",
        backgroundColor: "#44814e1a",
    },
    '1': {
        color: "#f7962b",
        backgroundColor: "#fef4e6",
    },
}

export default LoanScheduleStatusBtn;
