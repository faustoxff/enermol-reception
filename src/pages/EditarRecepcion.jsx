import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import RecepcionForm from "../components/RecepcionForm";
import {
  crearFormularioRecepcionInicial,
  mapFormDataToRecepcionPayload,
  mapRecepcionToFormData,
} from "../lib/recepciones";
import { supabase } from "../lib/supabase";

function EditarRecepcion() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(crearFormularioRecepcionInicial());
  const [cargando, setCargando] = useState(true);
  const [noEncontrada, setNoEncontrada] = useState(false);

  useEffect(() => {
    const cargarRecepcion = async () => {
      setCargando(true);
      setNoEncontrada(false);

      const { data, error } = await supabase
        .from("recepciones")
        .select("*")
        .eq("id", Number(id))
        .maybeSingle();

      if (error) {
        console.error("Error al cargar la recepción:", error);
        setNoEncontrada(true);
        setCargando(false);
        return;
      }

      if (!data) {
        setNoEncontrada(true);
        setCargando(false);
        return;
      }

      setFormData(mapRecepcionToFormData(data));
      setCargando(false);
    };

    cargarRecepcion();
  }, [id]);

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
      .update(mapFormDataToRecepcionPayload(formData))
      .eq("id", Number(id));

    if (error) {
      console.error("Error al actualizar:", error);
      alert(`Error al actualizar: ${error.message}`);
      return;
    }

    alert("Recepción actualizada correctamente");
    navigate("/");
  };

  if (cargando) {
    return <p>Cargando recepción...</p>;
  }

  if (noEncontrada) {
    return <p>Recepción no encontrada.</p>;
  }

  return (
    <div>
      <h2>Editar recepción</h2>
      <RecepcionForm
        formData={formData}
        onChange={handleChange}
        onSubmit={handleSubmit}
        submitLabel="Guardar cambios"
      />
    </div>
  );
}

export default EditarRecepcion;
