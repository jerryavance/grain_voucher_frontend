import { FC } from "react";
import useAuth from "../hooks/useAuth";
import Page403 from "../pages/403";

interface IRouteGuardProps {
    requiredUsers?: string[];
    requiredPermissions: string[];
}

const RouteGuard: FC<IRouteGuardProps> = ({ requiredPermissions, requiredUsers, children }) => {
    const { user }: any = useAuth();

    const hasPermission = (permission: string) => {
        return user?.user_permissions?.includes(permission);
    }

    const isRightUser = () => {
        if (!requiredUsers) return true;
        return requiredUsers.includes(user.type);
    }

    const canAccess = requiredPermissions.every(hasPermission) && isRightUser();

    if (!canAccess) {
        return <Page403 />
    }

    return <>{children}</>
}

export default RouteGuard;