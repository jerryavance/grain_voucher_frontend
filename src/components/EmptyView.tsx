import React from "react";
import styled from "styled-components";
import { Typography } from "@mui/material";
import { SentimentDissatisfied } from "@mui/icons-material";

const EmptyContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 40px 20px;
  gap: 16px;
  background-color: #f5f5f5;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const StyledIcon = styled(SentimentDissatisfied)`
  font-size: 64px !important;
  color: #757575;
`;

const Title = styled(Typography)`
  font-weight: 600 !important;
  color: #424242;
`;

const Subtitle = styled(Typography)`
  color: #757575;
`;

interface EmptyViewProps {
  title?: string;
  subtitle?: string;
}

const EmptyView: React.FC<EmptyViewProps> = ({
  title = "No Data Available",
  subtitle = "There is nothing to display at the moment.",
}) => {
  return (
    <EmptyContainer>
      <StyledIcon />
      <Title variant="h5">{title}</Title>
      <Subtitle variant="body1">{subtitle}</Subtitle>
    </EmptyContainer>
  );
};

export default EmptyView;