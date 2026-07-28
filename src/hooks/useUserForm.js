import { useContext } from "react";
import { UserFormContext } from "../context/UserFormContext";

const useUserForm = () => {
  const context = useContext(UserFormContext);

  if (!context) {
    throw new Error(
      'useUserForm must be used within a UserFormProvider. ' +
      'Make sure to wrap your component with <UserFormProvider>.'
    );
  }

  return context;
}

export default useUserForm;