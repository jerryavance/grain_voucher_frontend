import { Button } from "@mui/material";
import { IInvestment } from "../Investment.interface";
import { FC, useState } from "react";
import { useNavigate } from "react-router-dom";
import BuyInvestmentForm from "../BuyInvestmentForm";
import {
  CardWrapper,
  DateIndicator,
  Divider,
  ImageHeader,
  QRWrapper,
} from "./CardComponents";
import useAuth from "../../../hooks/useAuth";
import { APP_NAME, MEDIA_BASE_URL } from "../../../api/constants";
import UkoAvatar from "../../../components/UkoAvatar";
import { GppGood } from "@mui/icons-material";

interface InvestmentCardProps {
  investment: IInvestment;
}

export const InvestmentCard: FC<InvestmentCardProps> = ({ investment }) => {
  const [toggle, setToggle] = useState(false);
  const toggleCard = () => setToggle(!toggle);

  if (toggle)
    return <CardBack investment={investment} toggleCard={toggleCard} />;
  return <CardFront investment={investment} toggleCard={toggleCard} />;
};

const CardFront = ({
  investment,
  toggleCard,
}: {
  investment: IInvestment;
  toggleCard?: any;
}) => {
  const purpose = investment.purpose || "No Purpose";
  const amount = investment.amount || "No Amount";
  const type = investment?.investment_type || "Type";
  const interest = investment?.interest_rate || "Interest";

  const navigate = useNavigate();
  const handleView = () => {
    navigate(`/investments/details/${investment.id}`);
  };

  return (
    <CardWrapper className="x100 whiteBg h100 radius10 animate hidden">
      {/* TAG */}

      {/* HEADER */}
      <ImageHeader type={type} />
      {/* BODY */}
      <div className="p20 flexColumn gap10">
        <div className="flex gap10">
          <div className="font16 bold flexGrow">{amount}</div>
          <div className="textDisabled bold">• {interest} % </div>
        </div>
        <div className="font13 semiBold mainColor1">
          <span className="textDisabled regular">@ </span>
          {purpose}
        </div>

        {/* DIVIDER */}
        <Divider />

        {/* DATE */}
        <DateIndicator
          startDate={investment?.start_date}
          endDate={investment?.end_date}
        />

        {/* BUTTONS */}
        <div className="flex gap10">
          <Button variant="contained" fullWidth onClick={handleView}>
            View
          </Button>
          <Button variant="contained" onClick={toggleCard}>
            Buy
          </Button>
        </div>
      </div>
    </CardWrapper>
  );
};

const CardBack = ({
  investment,
  toggleCard,
}: {
  investment: IInvestment;
  toggleCard?: any;
}) => {
  return (
    <CardWrapper className="x100 whiteBg h100 radius10 animate hidden">
      <div className="h100 flexCenter">
        <BuyInvestmentForm
          investmentId={investment.id} // Pass the investment ID
          investmentName={investment.investment_name} // Pass investment name for context
          handleCancel={toggleCard} // Pass cancel handler
          handleRefreshInvestmentData={() => {}}
          handleRefreshParticipantData={() => {}}
        />
      </div>
    </CardWrapper>
  );
};

// COMPONENTS

export const AssetsCard = ({ data }: { data: any }) => {
  const { user } = useAuth();

  // Map API fields to the expected structure
  const { id, investment_type, investment_name, issuer_country, investment_bank_details } = data || {};

  const qrCodeData = {
    investment_id: id,
    user_id: user?.id
  };

  return (
    <CardWrapper className="x100 whiteBg h100 radius10 animate hidden">
      <ImageHeader type={investment_type} height={300} />
      {/* USER */}
      <div className="flexCenter">
        <div
          className="flexNullCenter gap10 whiteBg radius10 p20"
          style={{
            position: "absolute",
            boxShadow: "rgba(145, 158, 171, 0.16) -40px 40px 80px",
            padding: "10px 15px",
          }}
        >
          <UkoAvatar
            src={
              `${MEDIA_BASE_URL}${user?.profile?.photo_url}` ||
              "/static/avatar/001-man.svg"
            }
            sx={{
              border: 2,
              width: 60,
              height: 60,
              borderColor: "#ffffff00",
            }}
          />
          <div>
            <div className="semiBold">
              {user?.first_name} {user?.last_name}
            </div>

            <div className="font12 textDisabled flexNullCenter gap5">
              <GppGood sx={{ fontSize: 18 }} />
              <div>Verified</div>
            </div>
          </div>
        </div>
      </div>
      {/* BASE */}
      <div className="p20 flexCenter flexColumn gap10">
        {/* TITLE */}
        <div className="font18 bold" style={{ marginTop: 35 }}>
          {investment_name}
        </div>
        <Divider />
        <div className="flexNullCenter gap10">
          {investment_bank_details?.name && (
            <>
              <div className="font13 text-center">{investment_bank_details?.name}</div>
              <div className="textDisabled">|</div>
            </>
          )}
          <div className="textDisabled bold">{issuer_country}</div>
        </div>
        {/* QRCODE */}
        <QRWrapper
          className="animate pointer mt5"
          src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${JSON.stringify(qrCodeData)}`}
          alt="QR Code"
        />
      </div>
    </CardWrapper>
  );
};