import { useState } from "react";
import { crearFormularioRecepcionInicial } from "./recepciones";

export function useFormRecepcion(inicial = {}) {
  const [formData, setFormData] = useState(() =>
    crearFormularioRecepcionInicial(inicial)
  );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  return { formData, setFormData, handleChange };
}
