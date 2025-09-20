import { Check, Close, Edit } from "@mui/icons-material";
import { Button, Descriptions, Input } from "antd";
import { useState } from "react";
import styled from "styled-components";
import { stringify } from "../../../utils/helpers";

export const DetailsView = ({
  title,
  items,
  span = 2,
  isEditable = true,
}: {
  title?: any;
  isEditable?: boolean;
  items?: any[];
  span?: number;
}) => {
  const [editing, setEditing] = useState(false);
  const toggleEditing = () => setEditing(!editing);
  const ActionIcon = editing ? Close : Edit;

  const actionProps = {
    style: { boxShadow: "none" },
    size: "small",
    className: "font11 semiBold",
  };

  const appTitle = isEditable ? (
    <div className="flexSpaceCenter">
      <div>{title}</div>

      {/* END */}
      <ActionWrapper className="p5 flexNullCenter gap10">
        {/* SUBMIT */}
        {editing && (
          <Button
            type="primary"
            icon={<Check sx={{ fontSize: 14 }} />}
            {...(actionProps as any)}
          >
            Submit
          </Button>
        )}

        <Button
          type={editing ? "dashed" : "primary"}
          icon={<ActionIcon sx={{ fontSize: 14 }} />}
          onClick={toggleEditing}
          {...(actionProps as any)}
        >
          {editing ? "Cancel" : "Edit"}
        </Button>
      </ActionWrapper>
    </div>
  ) : (
    title
  );
  return (
    <Descriptions
      title={appTitle}
      size="small"
      contentStyle={{ fontSize: 12 }}
      labelStyle={{
        fontSize: 12,
        fontWeight: 600,
        maxWidth: 100,
        color: "black",
      }}
      bordered
      items={items?.map((item) => {
        const { field, value, label } = item || {};
        return {
          ...item,
          label: <div className="capitalize">{stringify(label)}</div>,
          span,
          children:
            editing && field ? (
              <div>
                <Input name={field} className="font12" value={value} />
              </div>
            ) : value || !isNaN(value) ? (
              value
            ) : (
              <div className="textDisabled">N/A</div>
            ),
        };
      })}
    />
  );
};

const ActionWrapper = styled.div`
  flex-wrap: wrap;
  justify-content: flex-end;
`;
