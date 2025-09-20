import { IInvestment } from "../Investment.interface";
import { FC } from "react";
import {
  CardWrapper,
  DateIndicator,
  Divider,
  ImageHeader,
} from "../Dashboards/CardComponents";
import moment from "moment";
import { Link } from "react-router-dom";

interface InvestmentCardProps {
  investment: IInvestment;
}

export const PastInvestmentCard: FC<InvestmentCardProps> = ({ investment }) => {
  return (
    <CardWrapper className="x100 whiteBg h100 radius10 animate hidden">
      {/* TAG */}
      <Link to={`/investments/details/${investment.id}`}>
        {/* HEADER */}
        <ImageHeader type={investment?.investment_type || ""} height={100} />

        {/* BODY */}
        <div className="p20 flexColumn gap10">
          <div className="flex gap10">
            <div className="font16 bold flexGrow text-center">
              {investment?.investment_name}
            </div>
          </div>
          <div className="font12 mainColor1 text-center">
            <span className="textDisabled regular">@ </span>
            {investment?.investment_bank_details?.name}
          </div>
          <div className="font12 mainColor1 text-center">
            {investment?.total_investment_amount} {investment?.currency}
          </div>

          {/* DIVIDER */}
          <Divider />

          {/* DATE */}
          <div className="font11 text-center semiBold">
            {moment(investment?.start_date).format("ll") || "N/A"} -{" "}
            {moment(investment?.end_date).format("ll") || "N/A"}
          </div>
        </div>
      </Link>
    </CardWrapper>
  );
};
