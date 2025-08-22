import { z } from "zod";
import { AutoForm } from "./components/AutoForm";
import { TextField } from "../forms/components/TextField";
// import { submitFormData } from "./api-client";

interface UserDTO {
  email: string;
  password: string;
  name: string;
}

const UserDTOSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(1, "Name is required"),
});

const defaultValues: UserDTO = {
  email: "",
  password: "",
  name: "",
};

export function UserForm() {
  const handleSubmit = async (data: UserDTO) => {
    // await submitFormData("/users", data);
    alert("User created successfully!");
  };

  return (
    <AutoForm
      schema={UserDTOSchema}
      defaultValues={defaultValues}
      onSubmit={handleSubmit}
    >
      <TextField name="email" label="Email" type="email" required />
      <TextField name="password" label="Password" type="password" required />
      <TextField name="name" label="Name" required />
    </AutoForm>
  );
}
