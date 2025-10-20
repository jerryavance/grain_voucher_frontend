// // components/UI/DropdownActionBtn.tsx
// import React, { useState } from "react";
// import { IconButton, Menu, MenuItem } from "@mui/material";
// import { Span } from "../Typography";
// import MoreVert from "@mui/icons-material/MoreVert";

// export interface IDropdownAction {
//   label: string | React.ReactElement;
//   onClick: (...args: any) => void;
//   icon?: React.ReactNode;
//   condition?: (data: any) => boolean; // Add this optional property
// }

// const DropdownActionBtn: React.FC<{
//   actions: IDropdownAction[];
//   metaData: any;
//   btnColor?: any;
// }> = ({ actions, metaData, btnColor }) => {
//   const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

//   const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
//     setAnchorEl(event.currentTarget);
//   };

//   const handleCloseMenu = () => {
//     setAnchorEl(null);
//   };

//   const handleActionClick = (action: any) => {
//     action && action(metaData);
//     handleCloseMenu();
//   };

//   // Filter actions based on condition
//   const visibleActions = actions.filter((action) => {
//     // If condition exists, evaluate it; otherwise, show the action
//     return action.condition ? action.condition(metaData) : true;
//   });

//   // Don't render the button if no actions are visible
//   if (visibleActions.length === 0) {
//     return null;
//   }

//   return (
//     <div>
//       <IconButton size="small" onClick={handleOpenMenu}>
//         <MoreVert fontSize="small" />
//       </IconButton>
//       <Menu
//         anchorEl={anchorEl}
//         open={Boolean(anchorEl)}
//         onClose={handleCloseMenu}
//       >
//         {visibleActions.map((action: IDropdownAction, index) => {
//           return (
//             <MenuItem
//               key={index}
//               onClick={() => handleActionClick(action.onClick)}
//             >
//               {action.icon}
//               <Span sx={{ marginLeft: "0.5rem" }}>{action.label}</Span>
//             </MenuItem>
//           );
//         })}
//       </Menu>
//     </div>
//   );
// };

// export default DropdownActionBtn;




import React, { useState } from "react";
import { IconButton, Menu, MenuItem } from "@mui/material";
import { Span } from "../Typography";
import MoreVert from "@mui/icons-material/MoreVert";

// Define IDropdownAction as a generic interface with default type 'any'
export interface IDropdownAction<T = any> {
  label: string | React.ReactElement;
  onClick: (data: T) => void;
  icon?: React.ReactNode;
  condition?: (data: T) => boolean; // Use generic type T for condition
}

const DropdownActionBtn = <T = any>({
  actions,
  metaData,
  btnColor,
}: {
  actions: IDropdownAction<T>[];
  metaData: T;
  btnColor?: any;
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleActionClick = (action: IDropdownAction<T>) => {
    action.onClick(metaData);
    handleCloseMenu();
  };

  // Filter actions based on condition
  const visibleActions = actions.filter((action) => {
    // If condition exists, evaluate it; otherwise, show the action
    return action.condition ? action.condition(metaData) : true;
  });

  // Don't render the button if no actions are visible
  if (visibleActions.length === 0) {
    return null;
  }

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
        {visibleActions.map((action: IDropdownAction<T>, index) => {
          return (
            <MenuItem
              key={index}
              onClick={() => handleActionClick(action)}
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