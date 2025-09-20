import { Tag } from "antd";
import { getStatusColor, stringify } from "../../utils/helpers";
import { IconButton } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";

export const SectionTitle = ({
  title,
  subtitle,
  tags,
}: {
  tags?: any;
  title: any;
  subtitle?: any;
}) => {
  return (
    <div>
      <div className="flexNullCenter gap10">
        <div className="font16 bold">{title}</div>
        {tags?.map(({ label, color }: any) => (
          <Tag className="semiBold" color={color}>
            {label}
          </Tag>
        ))}
      </div>
      <div className="font11 greyColor">{subtitle}</div>
    </div>
  );
};

export const StatusTag = ({ status }: { status: any }) => {
  return (
    <Tag color={getStatusColor(status)} className="semiBold capitalize">
      {stringify(status)}
    </Tag>
  );
};

export const ViewActionButton = ({ onClick }: { onClick?: any }) => {
  return (
    <IconButton size="small" onClick={onClick}>
      {<VisibilityIcon fontSize="small" />}
    </IconButton>
  );
};
