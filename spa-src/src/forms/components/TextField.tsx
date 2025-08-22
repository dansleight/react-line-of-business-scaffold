import { useFormContext } from "react-hook-form";
import { Form } from "react-bootstrap";

interface TextFieldProps {
  name: string;
  label: string;
  type?: "text" | "email" | "password" | "number" | "textarea";
  placeholder?: string;
  required?: boolean;
}

export function TextField({
  name,
  label,
  type = "text",
  placeholder,
  required,
}: TextFieldProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const error = errors[name];

  return (
    <Form.Group className="mb-2" controlId={name}>
      <Form.Label>
        {label}
        {required && <span className="text-danger">*</span>}
      </Form.Label>
      {type == "textarea" ? (
        <Form.Control
          as="textarea"
          placeholder={placeholder}
          isInvalid={!!error}
          {...register(name)}
        />
      ) : (
        <Form.Control
          type={type}
          placeholder={placeholder}
          isInvalid={!!error}
          {...register(name)}
        />
      )}

      {error && (
        <Form.Control.Feedback type="invalid">
          {error.message as string}
        </Form.Control.Feedback>
      )}
    </Form.Group>
  );
}
