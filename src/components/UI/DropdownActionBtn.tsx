import React, { useState } from "react";
import { IconButton, Menu, MenuItem } from "@mui/material";
import { Span } from "../Typography";
import MoreVert from "@mui/icons-material/MoreVert";

export interface IDropdownAction {
  label: string | React.ReactElement;
  onClick: (...args: any) => void;
  icon?: React.ReactNode;
}

const DropdownActionBtn: React.FC<{
  actions: IDropdownAction[];
  metaData: any;
  btnColor?: any;
}> = ({ actions, metaData, btnColor }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleActionClick = (action: any) => {
    action && action(metaData);
    handleCloseMenu();
  };

  return (
    <div>
      <IconButton size="small" onClick={handleOpenMenu}>
        <MoreVert fontSize="small" />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
      >
        {actions.map((action: IDropdownAction, index) => {
          return (
            <MenuItem
              key={index}
              onClick={() => handleActionClick(action.onClick)}
            >
              {action.icon}
              <Span sx={{ marginLeft: "0.5rem" }}>{action.label}</Span>
            </MenuItem>
          );
        })}
      </Menu>
    </div>
  );
};

export default DropdownActionBtn;
