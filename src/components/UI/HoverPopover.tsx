import { FC, useState } from "react";
import { Popover } from "@mui/material";

interface IHoverPopoverProps {
    Trigger: (popoverOptions: any) => React.ReactNode;
    Content: React.ReactNode;
}

const HoverPopover: FC<IHoverPopoverProps> = ({ Trigger, Content }) => {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

    const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handlePopoverClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);

    return (
        <div style={{display: 'inline-block'}}>
            {
                Trigger({
                    onMouseEnter: handlePopoverOpen,
                    onMouseLeave: handlePopoverClose,
                    "aria-haspopup": true,
                    "aria-owns": open ? 'mouse-over-popover' : undefined,
                })
            }
            {
                <Popover
                    id="mouse-over-popover"
                    sx={{
                        pointerEvents: 'none',
                    }}
                    open={open}
                    anchorEl={anchorEl}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'center',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'center',
                    }}
                    onClose={handlePopoverClose}
                    disableRestoreFocus
                >
                    {Content}
                </Popover>
            }
        </div>
    )
}

export default HoverPopover;