import { useSelector, useDispatch } from "react-redux";
import { setLoginSignupShown } from "./Frontend/Redux/store";
import { Navigate } from "react-router-dom";
import { useEffect } from "react";

const ProtectedRoute = ({ children }) => {
    const dispatch = useDispatch();
    const localUserId = useSelector((state) => state.user.user?.localUserId);
    const isLoginSignupShown = useSelector((state) => state.loginSignup.isLoginSignupShown);

    useEffect(() => {
        if (isLoginSignupShown) {
            dispatch(setLoginSignupShown(false));
        }
    }, [isLoginSignupShown, dispatch]);

    if (!localUserId) {
        dispatch(setLoginSignupShown(true));
        return <Navigate to="/" replace />;
        // "replace" is used to replace the current entry in the history, basically the user can't go back to the previous page
    }

    return children;
};

export default ProtectedRoute;