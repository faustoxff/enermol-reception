import { useState } from "react";
import { useNavigate } from "react-router-dom";
import RecepcionForm from "../components/RecepcionForm";
import {
  crearFormularioRecepcionInicial,
  mapFormDataToRecepcionPayload,
} from "../lib/recepciones";
import { supabase } from "../lib/supabase";

function NuevaRecepcion() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(crearFormularioRecepcionInicial());

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((currentFormData) => ({
      ...currentFormData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { error } = await supabase
      .from("recepciones")
      .insert([mapFormDataToRecepcionPayload(formData)]);

    if (error) {
      console.error("Error al guardar:", error);
      alert(`Error al guardar: ${error.message}`);
      return;
    }

    alert("Recepción guardada correctamente");
    navigate("/");
  };

  return (
    <div>
      <h2>Nueva recepción</h2>
      <RecepcionForm
        formData={formData}
        onChange={handleChange}
        onSubmit={handleSubmit}
        submitLabel="Guardar recepción"
      />
    </div>
  );
}

export default NuevaRecepcion;
